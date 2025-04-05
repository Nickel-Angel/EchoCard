use crate::models::Card;
use chrono::Utc;
use sqlx::{Result, SqlitePool};

pub fn merge_template_fields(fields: Vec<String>) -> String {
    fields.join("\u{001F}")
}

pub async fn create_card(
    pool: &SqlitePool,
    deck_id: i64,
    template_id: i64,
    template_fields: Vec<String>,
) -> Result<()> {
    let merged_fields = merge_template_fields(template_fields);
    let due = Utc::now().to_rfc3339();

    sqlx::query!(
        "INSERT INTO cards 
        (deck_id, template_id, template_fields, due, 
        stability, difficulty, scheduled_days, last_review) 
        VALUES (?, ?, ?, ?, NULL, NULL, 0, NULL)",
        deck_id,
        template_id,
        merged_fields,
        due
    )
    .execute(pool)
    .await?;

    Ok(())
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

    // 获取今天的日期范围（结束）
    let today = Utc::now();
    let today_end = today.date_naive().and_hms_opt(23, 59, 59).unwrap();
    let today_end_str = today_end.and_utc().to_rfc3339();

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
    .bind(today_end_str)
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
    // 获取今天的日期范围（开始和结束）
    let today = Utc::now();
    let today_start = today.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let today_end = today.date_naive().and_hms_opt(23, 59, 59).unwrap();

    // 转换为RFC3339格式，与数据库中存储的格式一致
    let today_start_str = today_start.and_utc().to_rfc3339();
    let today_end_str = today_end.and_utc().to_rfc3339();

    // 查询上次复习时间在今天，且due日期在今天以后的卡片数量
    let result = sqlx::query!(
        "SELECT COUNT(*) as count FROM cards 
        WHERE last_review >= ? AND last_review <= ? AND due > ?",
        today_start_str,
        today_end_str,
        today_end_str
    )
    .fetch_one(pool)
    .await?;

    Ok(result.count as u32)
}
