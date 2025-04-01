use crate::models::Deck;
use chrono::Utc;
use sqlx::{Result, SqlitePool};

pub async fn get_decks(pool: &SqlitePool) -> Result<Vec<Deck>> {
    // 查询所有卡组的基本信息
    let decks_rows = sqlx::query!("SELECT deck_id, name FROM decks")
        .fetch_all(pool)
        .await?;

    let mut decks = Vec::new();
    for row in decks_rows {
        let mut deck = Deck {
            deck_id: row.deck_id as u32,
            deck_name: row.name.clone(),
            tolearn: 0,
            learning: 0,
            reviewing: 0,
        };

        // 获取今天的日期范围（开始和结束）
        let today = Utc::now();
        let today_start = today.date_naive().and_hms_opt(0, 0, 0).unwrap();
        let today_end = today.date_naive().and_hms_opt(23, 59, 59).unwrap();

        // 转换为RFC3339格式，与数据库中存储的格式一致
        let today_start_str = today_start.and_utc().to_rfc3339();
        let today_end_str = today_end.and_utc().to_rfc3339();

        // 统计 tolearn：last_review 为 NULL 的卡片数量
        let tolearn_result = sqlx::query!(
            "SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND last_review IS NULL",
            deck.deck_id
        )
        .fetch_one(pool)
        .await?;
        deck.tolearn = tolearn_result.count as u32;

        // 统计 learning：last_review 和 due 均在今天的卡片数量
        let learning_result = sqlx::query!("SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND last_review >= ? AND last_review <= ? AND due >= ? AND due <= ?", 
            deck.deck_id, &today_start_str, &today_end_str, &today_start_str, &today_end_str)
            .fetch_one(pool)
            .await?;
        deck.learning = learning_result.count as u32;

        // 统计 reviewing：last_review 在今天之前，due 在今天及今天之前的卡片数量
        let reviewing_result = sqlx::query!("SELECT COUNT(*) as count FROM cards WHERE deck_id = ? AND last_review < ? AND due <= ?", 
            deck.deck_id, &today_start_str, &today_end_str)
            .fetch_one(pool)
            .await?;
        deck.reviewing = reviewing_result.count as u32;

        decks.push(deck);
    }

    Ok(decks)
}

// 获取卡组中的卡片总数
pub async fn get_card_count_by_deck(pool: &SqlitePool, deck_id: u32) -> Result<u32> {
    let result = sqlx::query!(
        "SELECT COUNT(*) as count FROM cards WHERE deck_id = ?",
        deck_id
    )
    .fetch_one(pool)
    .await?;

    Ok(result.count as u32)
}
