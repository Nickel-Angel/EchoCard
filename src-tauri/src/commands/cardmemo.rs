use std::collections::HashMap;

use crate::controller::card_controller::{get_card_count_learned_today, get_cards_by_page};
use crate::controller::deck_controller::get_decks;
use crate::controller::template_controller::parse_template;
use crate::models::Card;
use crate::models::Deck;
use crate::models::Template;
use crate::AppState;

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
