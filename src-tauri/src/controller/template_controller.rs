use crate::models::Template;
use rusqlite::{Connection, Result};

pub fn create_template(conn: &Connection) -> Result<()> {
    Ok(())
}

pub fn parse_template(conn: &Connection, template_id: u32) -> Result<Template> {
    // 首先查询模板基本信息
    let mut stmt = conn.prepare("SELECT template_id, name FROM templates WHERE template_id = ?")?;
    let template_result = stmt.query_row([template_id], |row| {
        Ok(Template {
            template_id: row.get(0)?,
            template_name: row.get(1)?,
            template_fields: Vec::new(),
        })
    });

    // 如果找不到模板，返回错误
    let mut template = match template_result {
        Ok(template) => template,
        Err(e) => return Err(e),
    };

    // 查询模板的所有字段
    let mut field_stmt = conn.prepare(
        "SELECT name, is_front FROM template_fields WHERE template_id = ? ORDER BY fields_id",
    )?;

    let fields_iter = field_stmt.query_map([template_id], |row| {
        let field_name: String = row.get(0)?;
        let is_front: bool = row.get(1)?;
        Ok((field_name, is_front))
    })?;

    // 收集所有字段
    for field_result in fields_iter {
        match field_result {
            Ok(field) => template.template_fields.push(field),
            Err(e) => return Err(e),
        }
    }

    // 如果没有找到任何字段，可能是一个异常情况
    if template.template_fields.is_empty() {
        return Err(rusqlite::Error::QueryReturnedNoRows);
    }

    Ok(template)
}
