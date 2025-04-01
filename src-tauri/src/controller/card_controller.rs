use crate::models::Card;
use crate::models::Deck;
use crate::models::Template;
use rusqlite::{Connection, Result};

pub fn merge_template_fields(fields: Vec<String>) -> String {
    fields.join("\u{001F}")
}

pub fn create_card(
    conn: &Connection,
    deck_id: i64,
    template_id: i64,
    template_fields: Vec<String>,
) -> Result<()> {
    let merged_fields = merge_template_fields(template_fields);
    let due = chrono::Utc::now().to_rfc3339();
    conn.execute(
        "INSERT INTO cards (deck_id, template_id, template_fields, due, stability, difficulty, scheduled_days, last_review) VALUES (?1, ?2, ?3, ?4, NULL, NULL, 0, NULL)",
        rusqlite::params![deck_id, template_id, merged_fields, due],
    )?;

    Ok(())
}

// 分页获取卡片
pub fn get_cards_by_page(
    conn: &Connection,
    deck_id: u32,
    page: u32,
    page_size: u32,
) -> Result<Vec<Card>> {
    let offset = page * page_size;

    let sql = "
      SELECT 
          c.card_id, c.deck_id, c.template_id, c.template_fields,
          c.due, c.stability, c.difficulty, c.scheduled_days, c.last_review
      FROM cards c
      WHERE c.deck_id = ?
      ORDER BY c.card_id
      LIMIT ? OFFSET ?
  ";

    let mut stmt = conn.prepare(sql)?;
    let rows = stmt.query_map([deck_id as i64, page_size as i64, offset as i64], |row| {
        // 从数据库行中解析数据并构建Card对象
        let card_id: u32 = row.get(0)?;
        let deck_id: u32 = row.get(1)?;
        let template_id: u32 = row.get(2)?;

        // 解析模板字段，使用Unicode分隔符分割
        let template_fields: String = row.get(3)?;
        let template_fields_content = template_fields
            .split('\u{001F}')
            .map(|s| s.to_string())
            .collect();

        // 解析日期时间字段
        let due_str: String = row.get(4)?;
        let due = chrono::DateTime::parse_from_rfc3339(&due_str)
            .map_err(|_| {
                rusqlite::Error::InvalidColumnType(
                    4,
                    "DateTime".to_string(),
                    rusqlite::types::Type::Text,
                )
            })?
            .with_timezone(&chrono::Utc);

        // 解析可能为NULL的字段
        let stability: Option<f32> = row.get(5)?;
        let difficulty: Option<f32> = row.get(6)?;
        let scheduled_days: u32 = row.get(7)?;

        let last_review_str: Option<String> = row.get(8)?;
        let last_review = if let Some(lr_str) = last_review_str {
            Some(
                chrono::DateTime::parse_from_rfc3339(&lr_str)
                    .map_err(|_| {
                        rusqlite::Error::InvalidColumnType(
                            8,
                            "DateTime".to_string(),
                            rusqlite::types::Type::Text,
                        )
                    })?
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

        Ok(Card {
            card_id,
            deck_id,
            template_id,
            template_fields_content,
            due,
            memory_state,
            scheduled_days,
            last_review,
        })
    })?;

    let mut cards = Vec::new();
    for card_result in rows {
        cards.push(card_result?);
    }

    Ok(cards)
}

pub fn get_card_count_learned_today(conn: &Connection) -> Result<u32> {
    // 获取今天的日期范围（开始和结束）
    let today = chrono::Utc::now();
    let today_start = today.date_naive().and_hms_opt(0, 0, 0).unwrap();
    let today_end = today.date_naive().and_hms_opt(23, 59, 59).unwrap();

    // 转换为RFC3339格式，与数据库中存储的格式一致
    let today_start_str = today_start.and_utc().to_rfc3339();
    let today_end_str = today_end.and_utc().to_rfc3339();

    // 查询上次复习时间在今天，且due日期在今天以后的卡片数量
    let count: i64 = conn.query_row(
        "SELECT COUNT(*) FROM cards WHERE last_review >= ? AND last_review <= ? AND due > ?",
        rusqlite::params![&today_start_str, &today_end_str, &today_end_str],
        |row| row.get(0),
    )?;

    Ok(count as u32)
}
