use crate::controller::card_controller::{
    create_card, delete_card_by_id, get_card_by_filter, update_card_fields,
};
use crate::controller::template_controller::{
    create_template, get_all_templates, get_template_fields,
};
use crate::models::Template;
use crate::models::{Card, TemplateField};
use crate::AppState;
use serde::{Deserialize, Serialize};
use std::fs;
use tauri::path::BaseDirectory;
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
pub struct TemplateConfig {
    templates: Vec<TemplateInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
struct TemplateInfo {
    templateName: String,
    className: String,
    importPath: String,
}

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

#[tauri::command]
pub async fn update_card_content(
    state: tauri::State<'_, AppState>,
    card_id: u32,
    template_fields: Vec<String>,
) -> Result<(), String> {
    update_card_fields(&state.pool, card_id, template_fields)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn add_template(
    state: tauri::State<'_, AppState>,
    template: Template,
) -> Result<(), String> {
    create_template(&state.pool, &template)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// 读取模板配置文件
///
/// 读取 templateConfig.json 文件中的内容并返回
#[tauri::command]
pub async fn get_template_config(handle: tauri::AppHandle) -> Result<TemplateConfig, String> {
    let config_path = handle
        .path()
        .resolve("templateConfig.json", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;
    let file = fs::File::open(config_path).map_err(|e| format!("打开模板配置文件失败: {}", e))?;
    let config: TemplateConfig =
        serde_json::from_reader(file).map_err(|e| format!("解析模板配置文件失败: {}", e))?;
    Ok(config)
}

/// 添加模板配置
///
/// 向 templateConfig.json 文件中添加新的模板配置
#[tauri::command]
pub async fn add_template_config(
    handle: tauri::AppHandle,
    template_name: String,
    class_name: String,
    import_path: String,
) -> Result<(), String> {
    let config_path = handle
        .path()
        .resolve("templateConfig.json", BaseDirectory::Resource)
        .map_err(|e| e.to_string())?;

    // 读取现有配置
    let config_content =
        fs::read_to_string(&config_path).map_err(|e| format!("读取模板配置文件失败: {}", e))?;
    let mut config: TemplateConfig = serde_json::from_str(&config_content)
        .map_err(|e| format!("解析模板配置文件失败: {}", e))?;

    // 检查是否存在同名模板
    if config
        .templates
        .iter()
        .any(|t| t.templateName == template_name)
    {
        return Err(format!("模板名称 '{}' 已存在", template_name));
    }

    // 添加新模板
    config.templates.push(TemplateInfo {
        templateName: template_name,
        className: class_name,
        importPath: import_path,
    });

    // 写回文件
    let updated_content =
        serde_json::to_string_pretty(&config).map_err(|e| format!("序列化模板配置失败: {}", e))?;

    fs::write(&config_path, updated_content).map_err(|e| format!("写入模板配置文件失败: {}", e))?;

    Ok(())
}

/// 删除卡片
///
/// 根据卡片ID删除指定的卡片及其相关复习记录
#[tauri::command]
pub async fn delete_card(state: tauri::State<'_, AppState>, card_id: u32) -> Result<(), String> {
    delete_card_by_id(&state.pool, card_id)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
