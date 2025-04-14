use chrono::Duration;
use std::collections::HashMap;

use chrono::Utc;
use fsrs::FSRS;
use serde::{Deserialize, Serialize};

use crate::controller::card_controller::{
    get_card_count_learned_today, get_cards_by_page, update_card_state,
};
use crate::controller::deck_controller::{delete_deck_by_id, get_decks};
use crate::controller::review_controller::create_review;
use crate::controller::template_controller::parse_template;
use crate::models::Card;
use crate::models::Deck;
use crate::models::Template;
use crate::AppState;

#[derive(Debug, Serialize, Deserialize)]
pub struct NextIntervals {
    pub again: u32,
    pub hard: u32,
    pub good: u32,
    pub easy: u32,
}

#[tauri::command]
pub async fn decks_display(state: tauri::State<'_, AppState>) -> Result<Vec<Deck>, String> {
    let decks = get_decks(&state.pool).await.map_err(|e| e.to_string())?;
    Ok(decks)
}

#[tauri::command]
pub async fn card_count_learned_today(state: tauri::State<'_, AppState>) -> Result<u32, String> {
    let count = get_card_count_learned_today(&state.pool)
        .await
        .map_err(|e| e.to_string())?;
    Ok(count)
}

#[tauri::command]
pub async fn delete_deck(state: tauri::State<'_, AppState>, deck_id: u32) -> Result<(), String> {
    delete_deck_by_id(&state.pool, deck_id)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_next_card(
    state: tauri::State<'_, AppState>,
    deck_id: u32,
    page_size: u32,
) -> Result<Vec<Card>, String> {
    let cards = get_cards_by_page(&state.pool, deck_id, page_size)
        .await
        .map_err(|e| e.to_string())?;
    let mut templates: HashMap<u32, Template> = HashMap::new();
    for card in cards.iter() {
        if templates.contains_key(&card.template_id) {
            continue;
        }
        let template = match parse_template(&state.pool, card.template_id).await {
            Ok(template) => template,
            Err(e) => {
                println!("Error loading template: {}", e);
                continue;
            }
        };
        templates.insert(card.template_id, template);
    }

    let mut loaded_template = state.loaded_template.lock().unwrap();
    *loaded_template = templates;

    Ok(cards)
}

#[tauri::command]
pub fn get_loaded_template(
    state: tauri::State<'_, AppState>,
    template_id: u32,
) -> Result<Template, String> {
    let loaded_template = state.loaded_template.lock().unwrap();
    if loaded_template.contains_key(&template_id) {
        Ok(loaded_template[&template_id].clone())
    } else {
        Err("Template not found".to_string())
    }
}

#[tauri::command]
pub async fn load_next_state(
    state: tauri::State<'_, AppState>,
    card: Card,
) -> Result<NextIntervals, String> {
    let fsrs = FSRS::new(Some(&state.fsrs_params)).unwrap();
    let review_date = Utc::now();
    let next_states = match card.last_review {
        Some(last_review) => {
            let elapsed_days = (review_date - last_review).num_days() as u32;
            fsrs.next_states(card.memory_state, state.desired_retention, elapsed_days)
                .unwrap()
        }
        None => fsrs
            .next_states(card.memory_state, state.desired_retention, 0)
            .unwrap(),
    };
    let mut loaded_card = state.loaded_card.lock().unwrap();
    *loaded_card = Some(card);
    let mut loaded_next_states = state.loaded_next_states.lock().unwrap();
    *loaded_next_states = Some(next_states.clone());
    Ok(NextIntervals {
        again: next_states.again.interval.round() as u32,
        hard: next_states.hard.interval.round() as u32,
        good: next_states.good.interval.round() as u32,
        easy: next_states.easy.interval.round() as u32,
    })
}

#[tauri::command]
pub async fn emit_card_review(
    state: tauri::State<'_, AppState>,
    rating: u32,
) -> Result<(), String> {
    let card = {
        let loaded_card = state.loaded_card.lock().unwrap();
        loaded_card.clone().expect("Card not loaded")
    };
    let next_states = {
        let loaded_next_states = state.loaded_next_states.lock().unwrap();
        loaded_next_states.clone().expect("Next states not loaded")
    };
    let next_state = match rating {
        1 => &next_states.again,
        2 => &next_states.hard,
        3 => &next_states.good,
        4 => &next_states.easy,
        _ => return Err("Invalid rating".to_string()),
    };
    let interval = next_state.interval.round() as u32;

    let memory_state = Some(next_state.memory.clone());
    let scheduled_days = interval;
    let last_review = Some(Utc::now());
    let due = card.last_review.unwrap_or(last_review.unwrap()) + Duration::days(interval as i64);

    update_card_state(
        &state.pool,
        card.card_id,
        memory_state,
        scheduled_days,
        last_review,
        due,
    )
    .await
    .map_err(|e| e.to_string())?;

    create_review(&state.pool, card.card_id, last_review.unwrap(), rating)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
