use chrono::{DateTime, NaiveDate, Utc};
use fsrs::{ComputeParametersInput, FSRSItem, FSRSReview, FSRS};
use serde_json::Value;
use sqlx::{Result, SqlitePool};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

pub async fn create_review(
    pool: &SqlitePool,
    card_id: u32,
    review_date: DateTime<Utc>,
    rating: u32,
) -> Result<()> {
    sqlx::query!(
        "INSERT INTO reviews 
        (card_id, review_date, rating) 
        VALUES (?, ?, ?)",
        card_id,
        review_date,
        rating
    )
    .execute(pool)
    .await?;

    Ok(())
}

/// 获取所有复习记录
///
/// 从数据库中获取所有卡片的复习记录
pub async fn get_all_reviews(pool: &SqlitePool) -> Result<Vec<(u32, NaiveDate, u32)>> {
    let rows = sqlx::query!(
        "SELECT card_id, review_date, rating FROM reviews ORDER BY card_id, review_date"
    )
    .fetch_all(pool)
    .await?;

    let reviews = rows
        .into_iter()
        .map(|row| {
            (
                row.card_id as u32,
                row.review_date.date(),
                row.rating as u32,
            )
        })
        .collect();

    Ok(reviews)
}

/// 训练FSRS模型参数
///
/// 使用数据库中的复习记录训练FSRS模型，返回优化后的参数
/// 如果提供了有效的fsrs_params参数，将优先使用该参数；否则从配置文件读取
pub async fn train_fsrs_parameters(pool: &SqlitePool, fsrs_params: [f32; 19]) -> Result<Vec<f32>> {
    // 检查传入的参数是否有效（非零值）
    let is_valid_params = fsrs_params.iter().any(|&x| x != 0.0);

    // 如果传入的参数有效，则使用传入的参数
    let initial_params = if is_valid_params {
        fsrs_params.to_vec()
    } else {
        // 否则从配置文件读取初始参数
        let config_path = Path::new("conf.json");
        let config_content = fs::read_to_string(config_path)
            .map_err(|e| sqlx::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;

        let config: Value = serde_json::from_str(&config_content)
            .map_err(|e| sqlx::Error::Io(std::io::Error::new(std::io::ErrorKind::Other, e)))?;

        if let Some(params) = config["fsrs_params"].as_array() {
            params
                .iter()
                .filter_map(|v| v.as_f64().map(|f| f as f32))
                .collect::<Vec<f32>>()
        } else {
            Vec::new() // 如果没有参数，使用空向量，FSRS库会使用默认参数
        }
    };

    // 获取所有复习记录
    let all_reviews = get_all_reviews(pool).await?;

    // 按卡片ID分组
    let mut reviews_by_card: HashMap<u32, Vec<(NaiveDate, u32)>> = HashMap::new();
    for (card_id, review_date, rating) in all_reviews {
        reviews_by_card
            .entry(card_id)
            .or_insert_with(Vec::new)
            .push((review_date, rating));
    }

    // 转换为FSRS库需要的格式
    let mut fsrs_items: Vec<FSRSItem> = Vec::new();
    for (_, reviews) in reviews_by_card {
        // 确保复习记录按日期排序
        let mut sorted_reviews = reviews.clone();
        sorted_reviews.sort_by(|a, b| a.0.cmp(&b.0));

        if sorted_reviews.len() < 2 {
            // 至少需要两条记录才能计算间隔
            continue;
        }

        let mut last_date = sorted_reviews[0].0;
        let mut fsrs_reviews = Vec::new();

        for (date, rating) in sorted_reviews {
            let delta_t = (date - last_date).num_days() as u32;
            fsrs_reviews.push(FSRSReview { rating, delta_t });

            // 为每个复习状态创建一个FSRSItem
            let item = FSRSItem {
                reviews: fsrs_reviews.clone(),
            };

            // 只添加包含长期记忆复习的项目
            if item.long_term_review_cnt() > 0 {
                fsrs_items.push(item);
            }

            last_date = date;
        }
    }

    // 如果没有足够的数据，返回初始参数
    if fsrs_items.len() < 10 {
        return Ok(initial_params);
    }

    // 创建FSRS实例并训练模型
    let fsrs = FSRS::new(if initial_params.is_empty() {
        None
    } else {
        Some(&initial_params)
    })
    .map_err(|e| {
        sqlx::Error::Io(std::io::Error::new(
            std::io::ErrorKind::Other,
            e.to_string(),
        ))
    })?;

    // 计算优化参数
    let optimized_parameters = fsrs
        .compute_parameters(ComputeParametersInput {
            train_set: fsrs_items,
            ..Default::default()
        })
        .map_err(|e| {
            sqlx::Error::Io(std::io::Error::new(
                std::io::ErrorKind::Other,
                e.to_string(),
            ))
        })?;

    Ok(optimized_parameters)
}
