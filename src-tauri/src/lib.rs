mod commands;
mod controller;
mod database;
mod models;

use std::collections::HashMap;

use commands::cardmemo::{
    card_count_learned_today, decks_display, get_loaded_template, get_next_card,
};
use database::initialize_database;
use models::Template;
use sqlx::sqlite::SqlitePool;
use tauri::Manager;

use std::sync::{Arc, Mutex};

pub type SafeHashMap<T, E> = Arc<Mutex<HashMap<T, E>>>;

pub struct AppState {
    pool: SqlitePool,
    loaded_template: SafeHashMap<u32, Template>,
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

            app.manage(AppState {
                pool,
                loaded_template: Arc::new(Mutex::new(HashMap::new())),
            });
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            decks_display,
            card_count_learned_today,
            get_next_card,
            get_loaded_template,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
