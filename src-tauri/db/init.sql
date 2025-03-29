-- 卡牌模板
CREATE TABLE IF NOT EXISTS templates (
    template_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
-- 模板字段
CREATE TABLE IF NOT EXISTS template_fields (
    fields_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    is_front BOOLEAN NOT NULL,
    FOREIGN KEY (template_id) REFERENCES templates(template_id),
    PRIMARY KEY (fields_id, template_id)
);
-- 牌组
CREATE TABLE IF NOT EXISTS decks (
    deck_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);
-- 卡牌
CREATE TABLE IF NOT EXISTS cards (
    card_id INTEGER PRIMARY KEY AUTOINCREMENT,
    deck_id INTEGER NOT NULL,
    template_id INTEGER NOT NULL,
    template_fields TEXT NOT NULL,
    due DATE NOT NULL,
    stability REAL,
    difficulty REAL,
    scheduled_days INTEGER NOT NULL,
    last_review DATE,
    FOREIGN KEY (template_id) REFERENCES templates(template_id),
    FOREIGN KEY (deck_id) REFERENCES decks(deck_id)
);
-- 复习记录
CREATE TABLE IF NOT EXISTS reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    review_date DATETIME NOT NULL,
    rating INTEGER NOT NULL,
    FOREIGN KEY (card_id) REFERENCES cards(card_id)
);