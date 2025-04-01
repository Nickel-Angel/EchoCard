use crate::controller::card_controller::get_card_count_learned_today;
use crate::controller::deck_controller::get_decks;
use crate::models::Deck;
use crate::AppState;

#[tauri::command]
pub async fn decks_display(state: tauri::State<'_, AppState>) -> Result<Vec<Deck>, String> {
    let decks = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        get_decks(&conn).map_err(|e| e.to_string())?
    };
    Ok(decks)
}

#[tauri::command]
pub async fn card_count_learned_today(state: tauri::State<'_, AppState>) -> Result<u32, String> {
    let count = {
        let conn = state.conn.lock().map_err(|e| e.to_string())?;
        get_card_count_learned_today(&conn).map_err(|e| e.to_string())?
    };
    Ok(count)
}
