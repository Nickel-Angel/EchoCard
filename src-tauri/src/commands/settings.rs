use crate::controller::review_controller::train_fsrs_parameters;
use crate::AppState;

/// 训练FSRS模型参数
///
/// 使用数据库中的复习记录训练FSRS模型，返回优化后的参数
#[tauri::command]
pub async fn train_fsrs_model(state: tauri::State<'_, AppState>) -> Result<Vec<f32>, String> {
    // 获取当前的FSRS参数
    let current_params = {
        let params = state.fsrs_params.lock().unwrap();
        *params
    };

    // 调用controller中的训练函数，传入当前参数作为初始值
    let optimized_parameters = train_fsrs_parameters(&state.pool, current_params)
        .await
        .map_err(|e| e.to_string())?;

    // 更新应用状态中的FSRS参数
    if !optimized_parameters.is_empty() {
        // 获取fsrs_params的锁
        let mut fsrs_params = state.fsrs_params.lock().unwrap();

        // 复制优化后的参数到数组中
        for (i, &param) in optimized_parameters.iter().enumerate() {
            if i < fsrs_params.len() {
                fsrs_params[i] = param;
            }
        }
    }

    Ok(optimized_parameters)
}

/// 获得FSRS模型参数
///
/// 返回当前的FSRS参数
#[tauri::command]
pub async fn get_fsrs_params(state: tauri::State<'_, AppState>) -> Result<[f32; 19], String> {
    let params = state.fsrs_params.lock().unwrap();
    Ok(params.clone())
}

// 获得当前的记忆留存率
#[tauri::command]
pub async fn get_desired_retention(state: tauri::State<'_, AppState>) -> Result<f32, String> {
    let desired_retention = state.desired_retention.lock().unwrap();
    Ok(*desired_retention)
}

// 设置记忆留存率
#[tauri::command]
pub async fn set_desired_retention(
    state: tauri::State<'_, AppState>,
    retention: f32,
) -> Result<(), String> {
    let mut desired_retention = state.desired_retention.lock().unwrap();
    *desired_retention = retention;
    Ok(())
}
