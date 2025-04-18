use crate::models::Deck;
use chrono::{Local, Utc};
use sqlx::{Result, SqlitePool};

pub async fn create_deck(pool: &SqlitePool, deck_name: &str) -> Result<u32> {
    let deck_id = sqlx::query!("INSERT INTO decks (name) VALUES (?)", deck_name)
        .execute(pool)
        .await?
        .last_insert_rowid() as u32;
    Ok(deck_id)
}

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
            toreview: 0,
        };

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

        // 统计 tolearn：last_review 为 NULL 的卡片数量
        let tolearn_result = sqlx::query!(
            "SELECT COUNT(*) as count FROM cards 
            WHERE deck_id = ? AND last_review 
            IS NULL",
            deck.deck_id
        )
        .fetch_one(pool)
        .await?;
        deck.tolearn = tolearn_result.count as u32;

        // 统计 learning：last_review 和 due 均在今天的卡片数量
        let learning_result = sqlx::query!(
            "SELECT COUNT(*) as count FROM cards 
            WHERE deck_id = ? AND last_review >= ? 
            AND last_review <= ? AND due >= ? AND due <= ?",
            deck.deck_id,
            today_start_utc,
            today_end_utc,
            today_start_utc,
            today_end_utc
        )
        .fetch_one(pool)
        .await?;
        deck.learning = learning_result.count as u32;

        // 统计 toreview：last_review 在今天之前，due 在今天及今天之前的卡片数量
        let toreview_result = sqlx::query!(
            "SELECT COUNT(*) as count FROM cards 
            WHERE deck_id = ? AND last_review < ? AND due <= ?",
            deck.deck_id,
            today_start_utc,
            today_end_utc
        )
        .fetch_one(pool)
        .await?;
        deck.toreview = toreview_result.count as u32;

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

pub async fn delete_deck_by_id(pool: &SqlitePool, deck_id: u32) -> Result<()> {
    // 开启事务
    let mut tx = pool.begin().await?;

    // 1. 首先获取该牌组下所有卡片的ID
    let cards = sqlx::query!("SELECT card_id FROM cards WHERE deck_id = ?", deck_id)
        .fetch_all(&mut *tx)
        .await?;

    // 2. 删除这些卡片的所有复习记录
    for card in &cards {
        sqlx::query!("DELETE FROM reviews WHERE card_id = ?", card.card_id)
            .execute(&mut *tx)
            .await?;
    }

    // 3. 删除牌组中的所有卡片
    sqlx::query!("DELETE FROM cards WHERE deck_id = ?", deck_id)
        .execute(&mut *tx)
        .await?;

    // 4. 最后删除牌组本身
    sqlx::query!("DELETE FROM decks WHERE deck_id = ?", deck_id)
        .execute(&mut *tx)
        .await?;

    // 提交事务
    tx.commit().await?;

    Ok(())
}
