use crate::utils::DB_NAME;
use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;

pub fn initialize_database(db_path: PathBuf) -> Result<Connection> {
    // Open the SQLite database file
    let conn = Connection::open_with_flags(
        db_path.join(DB_NAME),
        rusqlite::OpenFlags::SQLITE_OPEN_READ_WRITE | rusqlite::OpenFlags::SQLITE_OPEN_CREATE,
    )?;

    let sql = match fs::read_to_string(db_path.join("init.sql")) {
        Ok(sql) => sql,
        Err(e) => {
            println!("{}", e.to_string());
            String::from("")
        }
    };

    conn.execute_batch(&sql)?;

    Ok(conn)
}
