use crate::controller::card_controller::create_card;
use crate::controller::deck_controller::create_deck;
use crate::controller::template_controller::create_template;
use crate::models::Template;
use sqlx::{sqlite::SqlitePool, Result};
use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;

pub async fn initialize_database(db_url: &str) -> Result<SqlitePool> {
    println!("数据库连接URL: {}", db_url);

    // 从URL中提取数据库文件路径
    let db_path = db_url
        .strip_prefix("sqlite://")
        .expect("DATABASE_URL must start with sqlite://");
    let db_file_path = PathBuf::from(db_path);
    let current_path = PathBuf::from(".");
    let db_dir = db_file_path.parent().unwrap_or(&current_path);

    // 创建数据库目录
    if let Err(e) = fs::create_dir_all(db_dir) {
        if e.kind() != ErrorKind::AlreadyExists {
            println!("创建数据库目录失败: {}", e);
            return Err(sqlx::Error::Io(e));
        }
    }

    // 检查数据库文件是否存在
    let db_file_exists = db_file_path.exists();
    println!("数据库文件{}存在", if db_file_exists { "" } else { "不" });

    // 创建SQLite连接池
    let pool = SqlitePool::connect(&db_url).await?;

    // 读取初始化SQL文件
    let init_sql_path = PathBuf::from(db_dir).join("init.sql");
    let sql = match fs::read_to_string(init_sql_path) {
        Ok(sql) => sql,
        Err(e) => {
            println!("读取初始化SQL文件失败: {}", e.to_string());
            String::from("")
        }
    };

    // 执行初始化SQL（如果数据库文件不存在或者强制执行）
    if !sql.is_empty() && !db_file_exists {
        println!("数据库文件不存在，执行初始化SQL...");
        sqlx::query(&sql).execute(&pool).await?;
        println!("初始化SQL执行完成");
    } else if !sql.is_empty() {
        println!("数据库文件已存在，跳过初始化SQL");
    }

    Ok(pool)
}

pub async fn initialize_decks(pool: &SqlitePool) -> Result<()> {
    // 检查数据库中是否已有卡组
    let decks_count: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM decks")
        .fetch_one(pool)
        .await?;

    if decks_count.0 != 0 {
        println!("数据库中已有卡组，跳过初始化卡组");
        return Ok(());
    }

    // 创建示例卡组
    println!("数据库中没有卡组，创建示例卡组和卡片...");

    // 创建示例卡组
    let deck_id = create_deck(pool, "示例卡组").await?;

    // 创建或获取选择题模板
    let choice_template_name = "选择题卡片";
    let choice_template_id = match crate::controller::template_controller::get_template_by_name(
        pool,
        choice_template_name,
    )
    .await?
    {
        Some(template) => template.template_id,
        None => {
            // 模板不存在，创建新模板
            let template = Template {
                template_id: 0,
                template_name: choice_template_name.to_string(),
                template_fields: vec![
                    ("问题".to_string(), true),
                    ("选项".to_string(), true),
                    ("答案".to_string(), false),
                    ("解析".to_string(), false),
                ],
            };
            create_template(pool, &template).await?
        }
    };

    // 创建或获取普通卡片模板
    let basic_template_name = "正反面卡片";
    let basic_template_id = match crate::controller::template_controller::get_template_by_name(
        pool,
        basic_template_name,
    )
    .await?
    {
        Some(template) => template.template_id,
        None => {
            // 模板不存在，创建新模板
            let template = Template {
                template_id: 0,
                template_name: basic_template_name.to_string(),
                template_fields: vec![("正面".to_string(), true), ("反面".to_string(), false)],
            };
            create_template(pool, &template).await?
        }
    };

    // 创建示例选择题卡片
    let choice_card_fields = vec![
        "什么是间隔重复？".to_string(),
        "A. 一种记忆技术\nB. 一种学习方法\nC. 一种记忆软件\nD. 以上都是".to_string(),
        "D".to_string(),
        "间隔重复是一种记忆技术，也是一种学习方法，同时也有很多基于此原理的记忆软件。".to_string(),
    ];

    create_card(pool, deck_id, choice_template_id, choice_card_fields).await?;

    // 创建示例正反面卡片
    let basic_card_fields = vec![
        "EchoCard 是什么？".to_string(),
        "EchoCard 是一款基于间隔重复原理的记忆卡片软件，帮助用户高效学习和记忆知识。".to_string(),
    ];

    create_card(pool, deck_id, basic_template_id, basic_card_fields).await?;

    println!("初始化卡组完成，创建了示例卡组和卡片");

    Ok(())
}
