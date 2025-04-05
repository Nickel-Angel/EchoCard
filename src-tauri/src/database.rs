use sqlx::{sqlite::SqlitePool, Result};
use std::env;
use std::fs;
use std::io::ErrorKind;
use std::path::PathBuf;

pub async fn initialize_database() -> Result<SqlitePool> {
    // 从环境变量获取数据库URL
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set in .env file");
    println!("数据库连接URL: {}", db_url);

    // 从URL中提取数据库文件路径
    let db_path = db_url
        .strip_prefix("sqlite:///")
        .expect("DATABASE_URL must start with sqlite:///");
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
