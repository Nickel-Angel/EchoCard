mod commands;
mod controller;
mod database;
mod models;
mod utils;

use commands::cardmemo::{card_count_learned_today, decks_display};
use database::initialize_database;
use sqlx::sqlite::SqlitePool;
use tauri::path::BaseDirectory;
use tauri::Manager;

pub struct AppState {
    pool: SqlitePool,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            // 使用tokio运行时执行异步初始化数据库操作
            let runtime = tokio::runtime::Runtime::new().unwrap();

            let pool = runtime.block_on(async {
                match initialize_database().await {
                    Ok(pool) => pool,
                    Err(e) => {
                        println!("database connect error: {}", e.to_string());
                        panic!("database connect error");
                    }
                }
            });

            app.manage(AppState { pool });
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
