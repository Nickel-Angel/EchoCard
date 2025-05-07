use crate::controller::card_controller::{create_card, get_card_by_filter};
use crate::controller::template_controller::{get_all_templates, get_template_fields};
use crate::models::Template;
use crate::models::{Card, TemplateField};
use crate::AppState;

#[tauri::command]
pub async fn card_filter(
    state: tauri::State<'_, AppState>,
    template_ids: Vec<u32>,
    deck_ids: Vec<u32>,
    status_bit_filter: u8,
) -> Result<Vec<Card>, String> {
    let mut cards = get_card_by_filter(&state.pool, template_ids, deck_ids, status_bit_filter)
        .await
        .map_err(|e| e.to_string())?;
    cards.sort_by(|a, b| a.due.cmp(&b.due));

    Ok(cards)
}

#[tauri::command]
pub async fn template_display(state: tauri::State<'_, AppState>) -> Result<Vec<Template>, String> {
    let templates = get_all_templates(&state.pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(templates)
}

#[tauri::command]
pub async fn add_card(
    state: tauri::State<'_, AppState>,
    deck_id: u32,
    template_id: u32,
    template_fields: Vec<String>,
) -> Result<u32, String> {
    let card_id = create_card(&state.pool, deck_id, template_id, template_fields)
        .await
        .map_err(|e| e.to_string())?;

    Ok(card_id)
}

#[tauri::command]
pub async fn get_fields(
    state: tauri::State<'_, AppState>,
    template_id: u32,
) -> Result<Vec<TemplateField>, String> {
    let fields = get_template_fields(&state.pool, template_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(fields)
}
