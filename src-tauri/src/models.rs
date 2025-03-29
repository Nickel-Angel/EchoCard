use chrono::{DateTime, NaiveDate, Utc};
use fsrs::MemoryState;

pub struct Card {
    card_id: u32,
    deck_id: u32,
    template_id: u32,
    template_fields: Vec<String>, // Need to Convert
    // FSRS fields
    due: DateTime<Utc>,
    memory_state: Option<MemoryState>,
    scheduled_days: u32,
    last_review: Option<DateTime<Utc>>,
}

pub struct Template {
    template_id: u32,
    template_name: String,
    deck_id: u32,
    template_fields_name: Vec<String>,
}

pub struct Deck {
    deck_id: u32,
    deck_name: String,
    // Not Table Fields
    tolearn: u32,
    learning: u32,
    reviewing: u32,
    reviewed: u32,
}

pub struct Review {
    card_id: u32,
    review_date: NaiveDate,
    rating: u32,
}
