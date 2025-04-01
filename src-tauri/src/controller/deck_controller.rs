use crate::models::Deck;
use rusqlite::{Connection, Result};

pub fn get_decks(conn: &Connection) -> Result<Vec<Deck>> {
    let mut stmt = conn.prepare("SELECT deck_id, name FROM decks")?;
    let deck_iter = stmt.query_map([], |row| {
        Ok(Deck {
            deck_id: row.get(0)?,
            deck_name: row.get(1)?,
            tolearn: 0,
            learning: 0,
            reviewing: 0,
        })
    })?;

    let mut decks = Vec::new();
    for deck_result in deck_iter {
        let mut deck = deck_result?;

        // 获取今天的日期范围（开始和结束）
        let today = chrono::Utc::now();
        let today_start = today.date_naive().and_hms_opt(0, 0, 0).unwrap();
        let today_end = today.date_naive().and_hms_opt(23, 59, 59).unwrap();

        // 转换为RFC3339格式，与数据库中存储的格式一致
        let today_start_str = today_start.and_utc().to_rfc3339();
        let today_end_str = today_end.and_utc().to_rfc3339();

        // 统计 tolearn：last_review 为 NULL 的卡片数量
        let tolearn_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM cards WHERE deck_id = ? AND last_review IS NULL",
            [deck.deck_id],
            |row| row.get(0),
        )?;
        deck.tolearn = tolearn_count as u32;

        // 统计 learning：last_review 和 due 均在今天的卡片数量
        let learning_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM cards WHERE deck_id = ? AND last_review >= ? AND last_review <= ? AND due >= ? AND due <= ?",
            rusqlite::params![deck.deck_id, &today_start_str, &today_end_str, &today_start_str, &today_end_str],
            |row| row.get(0),
        )?;
        deck.learning = learning_count as u32;

        // 统计 reviewing：last_review 在今天之前，due 在今天及今天之前的卡片数量
        let reviewing_count: i64 = conn.query_row(
            "SELECT COUNT(*) FROM cards WHERE deck_id = ? AND last_review < ? AND due <= ?",
            rusqlite::params![deck.deck_id, &today_start_str, &today_end_str],
            |row| row.get(0),
        )?;
        deck.reviewing = reviewing_count as u32;

        decks.push(deck);
    }

    Ok(decks)
}

// 获取卡组中的卡片总数
pub fn get_card_count_by_deck(conn: &Connection, deck_id: u32) -> Result<u32> {
    let sql = "SELECT COUNT(*) FROM cards WHERE deck_id = ?";
    let count: i64 = conn.query_row(sql, [deck_id as i64], |row| row.get(0))?;

    Ok(count as u32)
}
