use chrono::{DateTime, NaiveDate, Utc};
use fsrs::MemoryState;
use serde::{Deserialize, Serialize};

mod memory_state_serde {
    use super::*;
    use serde::{Deserializer, Serializer};

    pub fn serialize<S>(state: &Option<MemoryState>, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match state {
            Some(state) => {
                let data = (state.stability, state.difficulty);
                data.serialize(serializer)
            }
            None => serializer.serialize_none(),
        }
    }

    pub fn deserialize<'de, D>(deserializer: D) -> Result<Option<MemoryState>, D::Error>
    where
        D: Deserializer<'de>,
    {
        let data: Option<(f32, f32)> = Option::deserialize(deserializer)?;

        Ok(data.map(|(stability, difficulty)| MemoryState {
            stability,
            difficulty,
        }))
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Card {
    pub card_id: u32,
    pub deck_id: u32,
    pub template_id: u32,
    pub template_fields_content: Vec<String>, // Need to Convert
    // FSRS fields
    pub due: DateTime<Utc>,
    #[serde(with = "memory_state_serde")]
    pub memory_state: Option<MemoryState>,
    pub scheduled_days: u32,
    pub last_review: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Template {
    pub template_id: u32,
    pub template_name: String,
    pub template_fields: Vec<(String, bool)>, // (Field Name, Is Front)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Deck {
    pub deck_id: u32,
    pub deck_name: String,
    // Not Table Fields
    pub tolearn: u32,
    pub learning: u32,
    pub reviewing: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Review {
    pub card_id: u32,
    pub review_date: NaiveDate,
    pub rating: u32,
}

impl Default for Template {
    fn default() -> Self {
        Self {
            template_id: 0,
            template_name: String::new(),
            template_fields: Vec::new(),
        }
    }
}

impl Default for Card {
    fn default() -> Self {
        Self {
            card_id: 0,
            deck_id: 0,
            template_id: 0,
            template_fields_content: Vec::new(),
            due: Utc::now(),
            memory_state: None,
            scheduled_days: 0,
            last_review: None,
        }
    }
}

impl Default for Deck {
    fn default() -> Self {
        Self {
            deck_id: 0,
            deck_name: String::new(),
            tolearn: 0,
            learning: 0,
            reviewing: 0,
        }
    }
}

impl Default for Review {
    fn default() -> Self {
        Self {
            card_id: 0,
            review_date: NaiveDate::from_ymd_opt(2023, 1, 1).unwrap(),
            rating: 0,
        }
    }
}
