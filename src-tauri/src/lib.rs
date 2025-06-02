mod commands;
mod controller;
mod database;
mod models;
use std::{collections::HashMap, fs};

use commands::cardedit::{
    add_card, add_deck, add_template, add_template_config, card_filter, delete_card, get_fields,
    get_template_config, template_display, update_card_content,
};
use commands::cardmemo::{
    card_count_learned_today, decks_display, delete_deck, emit_card_review, get_loaded_template,
    get_next_card, load_next_state,
};
use commands::settings::{
    get_desired_retention, get_fsrs_params, set_desired_retention, train_fsrs_model,
};
use database::{initialize_database, initialize_decks};
use fsrs::NextStates;
use models::{Card, Template};
use serde::{Deserialize, Serialize};
use sqlx::sqlite::SqlitePool;
use tauri::path::BaseDirectory;
use tauri::Manager;

use std::sync::{Arc, Mutex};

pub type Safe<T> = Arc<Mutex<T>>;
pub type SafeHashMap<T, E> = Safe<HashMap<T, E>>;

pub struct AppState {
    pool: SqlitePool,
    loaded_template: SafeHashMap<u32, Template>,
    loaded_card: Safe<Option<Card>>,
    loaded_next_states: Safe<Option<NextStates>>,
    fsrs_params: Safe<[f32; 19]>,
    desired_retention: Safe<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct Config {
    database_url: String,
    pub fsrs_params: [f32; 19],
    pub desired_retention: f32,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let conf_path = app.path().resolve("conf.json", BaseDirectory::Resource)?;
            let config_json = fs::read_to_string(conf_path)?;
            let config: Config = serde_json::from_str(&config_json)?;
            // 使用tokio运行时执行异步初始化数据库操作
            let runtime = tokio::runtime::Runtime::new().unwrap();

            let pool = runtime.block_on(async {
                match initialize_database(&config.database_url).await {
                    Ok(pool) => pool,
                    Err(e) => {
                        println!("database connect error: {}", e.to_string());
                        panic!("database connect error");
                    }
                }
            });

            runtime.block_on(async {
                match initialize_decks(&pool).await {
                    Ok(_) => (),
                    Err(e) => {
                        println!("decks init error: {}", e.to_string());
                        panic!("decks init error");
                    }
                }
            }); // 初始化decks

            app.manage(AppState {
                pool,
                loaded_template: Arc::new(Mutex::new(HashMap::new())),
                loaded_card: Arc::new(Mutex::new(None)),
                loaded_next_states: Arc::new(Mutex::new(None)),
                fsrs_params: Arc::new(Mutex::new(config.fsrs_params)),
                desired_retention: Arc::new(Mutex::new(config.desired_retention)),
            });
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // 获取应用状态
                let state = window.state::<AppState>();
                let handle = window.app_handle();
                let conf_path = handle
                    .path()
                    .resolve("conf.json", BaseDirectory::Resource)
                    .unwrap();

                // 读取现有配置
                if let Ok(config_json) = fs::read_to_string(&conf_path) {
                    if let Ok(mut config) = serde_json::from_str::<Config>(&config_json) {
                        // 只更新 FSRS 参数
                        let fsrs_params = state.fsrs_params.lock().unwrap();
                        let desired_retention = state.desired_retention.lock().unwrap();
                        config.fsrs_params = *fsrs_params;
                        config.desired_retention = *desired_retention;

                        // 将更新后的配置写回文件
                        if let Ok(updated_json) = serde_json::to_string_pretty(&config) {
                            if let Err(e) = fs::write(&conf_path, updated_json) {
                                println!("Failed to save config file: {}", e);
                            } else {
                                println!("FSRS parameters saved to config file");
                            }
                        }
                    }
                }
            }
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            decks_display,
            card_count_learned_today,
            get_next_card,
            get_loaded_template,
            emit_card_review,
            load_next_state,
            delete_deck,
            card_filter,
            template_display,
            add_card,
            get_fields,
            train_fsrs_model,
            get_fsrs_params,
            set_desired_retention,
            get_desired_retention,
            update_card_content,
            add_template,
            add_deck,
            get_template_config,
            add_template_config,
            delete_card,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
