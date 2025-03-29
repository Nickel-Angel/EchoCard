mod database;
mod models;
mod utils;

use database::initialize_database;
use rusqlite::Connection;
use tauri::path::BaseDirectory;
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sql_conn: Option<Connection> = None;
    tauri::Builder::default()
        .setup(move |app| {
            let db_path = app.path().resolve("db", BaseDirectory::Resource)?;
            sql_conn = match initialize_database(db_path) {
                Ok(conn) => Some(conn),
                Err(e) => {
                    println!("database connect error: {}", e.to_string());
                    return Err("database connect error".into());
                }
            };
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
