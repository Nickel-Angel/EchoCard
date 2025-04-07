use chrono::{DateTime, Utc};
use sqlx::{Result, SqlitePool};

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
