mod commands;
mod controller;
mod database;
mod models;
mod utils;

use commands::cardmemo::{card_count_learned_today, decks_display};
use database::initialize_database;
use rusqlite::Connection;
use std::sync::Mutex;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub struct AppState {
    conn: Mutex<Connection>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let db_path = app.path().resolve("db", BaseDirectory::Resource)?;
            let sql_conn = match initialize_database(db_path) {
                Ok(conn) => conn,
                Err(e) => {
                    println!("database connect error: {}", e.to_string());
                    return Err("database connect error".into());
                }
            };
            app.manage(AppState {
                conn: Mutex::new(sql_conn),
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            decks_display,
            card_count_learned_today
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
