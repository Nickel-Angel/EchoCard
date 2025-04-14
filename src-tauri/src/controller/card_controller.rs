use crate::models::Card;
use chrono::{DateTime, Local, Utc};
use sqlx::{Result, SqlitePool};

pub fn merge_template_fields(fields: Vec<String>) -> String {
    fields.join("\u{001F}")
}

pub async fn create_card(
    pool: &SqlitePool,
    deck_id: u32,
    template_id: u32,
    template_fields: Vec<String>,
) -> Result<u32> {
    let merged_fields = merge_template_fields(template_fields);
    let due = Utc::now();

    let card_id = sqlx::query!(
        "INSERT INTO cards 
        (deck_id, template_id, template_fields, due, 
        stability, difficulty, scheduled_days, last_review) 
        VALUES (?, ?, ?, ?, NULL, NULL, 0, NULL)",
        deck_id,
        template_id,
        merged_fields,
        due,
    )
    .execute(pool)
    .await?
    .last_insert_rowid() as u32;

    Ok(card_id)
}

// 分页获取卡片
pub async fn get_cards_by_page(
    pool: &SqlitePool,
    deck_id: u32,
    page_size: u32,
) -> Result<Vec<Card>> {
    let sql = "
      SELECT 
          c.card_id, c.deck_id, c.template_id, c.template_fields,
          c.due, c.stability, c.difficulty, c.scheduled_days, c.last_review
      FROM cards c
      WHERE c.deck_id = ? AND c.due <= ?
      ORDER BY c.due
      LIMIT ?
    ";

    // 获取当地时间的今天日期范围（结束）
    let today_local = Local::now();
    let today_end_local = today_local.date_naive().and_hms_opt(23, 59, 59).unwrap();
    // 转换为UTC时间用于数据库查询
    let today_end_utc = today_end_local
        .and_local_timezone(Local)
        .unwrap()
        .with_timezone(&Utc);

    // 使用sqlx查询数据库
    let rows = sqlx::query_as::<
        _,
        (
            i64,
            i64,
            i64,
            String,
            String,
            Option<f32>,
            Option<f32>,
            i64,
            Option<String>,
        ),
    >(sql)
    .bind(deck_id as i64)
    .bind(today_end_utc)
    .bind(page_size as i64)
    .fetch_all(pool)
    .await?;

    let mut cards = Vec::new();
    for (
        card_id,
        deck_id,
        template_id,
        template_fields,
        due_str,
        stability,
        difficulty,
        scheduled_days,
        last_review_str,
    ) in rows
    {
        // 解析模板字段，使用Unicode分隔符分割
        let template_fields_content = template_fields
            .split('\u{001F}')
            .map(|s| s.to_string())
            .collect();

        // 解析日期时间字段
        let due = chrono::DateTime::parse_from_rfc3339(&due_str)
            .map_err(|_| sqlx::Error::RowNotFound)?
            .with_timezone(&chrono::Utc);

        // 解析可能为NULL的last_review字段
        let last_review = if let Some(lr_str) = last_review_str {
            Some(
                chrono::DateTime::parse_from_rfc3339(&lr_str)
                    .map_err(|_| sqlx::Error::RowNotFound)?
                    .with_timezone(&chrono::Utc),
            )
        } else {
            None
        };

        // 构建内存状态
        let memory_state = if let (Some(s), Some(d)) = (stability, difficulty) {
            Some(fsrs::MemoryState {
                stability: s,
                difficulty: d,
            })
        } else {
            None
        };

        cards.push(Card {
            card_id: card_id as u32,
            deck_id: deck_id as u32,
            template_id: template_id as u32,
            template_fields_content,
            due,
            memory_state,
            scheduled_days: scheduled_days as u32,
            last_review,
        });
    }

    Ok(cards)
}

pub async fn get_card_count_learned_today(pool: &SqlitePool) -> Result<u32> {
    // 获取当地时间的今天日期范围（开始和结束）
    let today_local = Local::now();
    let today_start_local = today_local.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let today_end_local = today_local.date_naive().and_hms_opt(23, 59, 59).unwrap();

    // 转换为UTC时间用于数据库查询
    let today_start_utc = today_start_local
        .and_local_timezone(Local)
        .unwrap()
        .with_timezone(&Utc);
    let today_end_utc = today_end_local
        .and_local_timezone(Local)
        .unwrap()
        .with_timezone(&Utc);

    // 查询上次复习时间在今天，且due日期在今天以后的卡片数量
    let result = sqlx::query!(
        "SELECT COUNT(*) as count FROM cards 
        WHERE last_review >= ? AND last_review <= ? AND due > ?",
        today_start_utc,
        today_end_utc,
        today_end_utc
    )
    .fetch_one(pool)
    .await?;

    Ok(result.count as u32)
}

pub async fn update_card_state(
    pool: &SqlitePool,
    card_id: u32,
    memory_state: Option<fsrs::MemoryState>,
    scheduled_days: u32,
    last_review: Option<DateTime<Utc>>,
    due: DateTime<Utc>,
) -> Result<()> {
    // 转换 memory_state 为数据库字段
    let (stability, difficulty) = if let Some(state) = memory_state {
        (Some(state.stability), Some(state.difficulty))
    } else {
        (None, None)
    };

    sqlx::query!(
        "UPDATE cards 
        SET stability = ?, 
            difficulty = ?, 
            scheduled_days = ?,
            last_review = ?,
            due = ?
        WHERE card_id = ?",
        stability,
        difficulty,
        scheduled_days,
        last_review,
        due,
        card_id
    )
    .execute(pool)
    .await?;

    Ok(())
}
