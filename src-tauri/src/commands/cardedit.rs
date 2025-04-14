use crate::controller::card_controller::get_card_by_filter;
use crate::controller::template_controller::get_all_templates;
use crate::models::Card;
use crate::models::Template;
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
