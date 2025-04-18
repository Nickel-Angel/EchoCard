use crate::models::Template;
use sqlx::{Result, SqlitePool};

pub async fn get_template_by_name(
    pool: &SqlitePool,
    template_name: &str,
) -> Result<Option<Template>> {
    // 查询模板基本信息
    let template_row = sqlx::query!(
        "SELECT template_id, name FROM templates WHERE name = ?",
        template_name
    )
    .fetch_optional(pool)
    .await?;

    // 如果找不到模板，返回None
    let template_row = match template_row {
        Some(row) => row,
        None => return Ok(None),
    };

    let template_id = template_row.template_id as u32;
    let mut template = Template {
        template_id,
        template_name: template_row.name,
        template_fields: Vec::new(),
    };

    // 查询模板的所有字段
    let fields = sqlx::query!(
        "SELECT name, is_front FROM template_fields WHERE template_id = ? ORDER BY fields_id",
        template_id
    )
    .fetch_all(pool)
    .await?;

    // 收集所有字段
    for field in fields {
        template.template_fields.push((field.name, field.is_front));
    }

    // 如果没有找到任何字段，可能是一个异常情况，但我们仍然返回模板信息
    Ok(Some(template))
}

pub async fn get_all_templates(pool: &SqlitePool) -> Result<Vec<Template>> {
    // 查询所有模板基本信息
    let templates_rows = sqlx::query!("SELECT template_id, name FROM templates",)
        .fetch_all(pool)
        .await?;

    let mut templates = Vec::new();

    // 遍历每个模板，获取其字段信息
    for template_row in templates_rows {
        let template_id = template_row.template_id as u32;
        let mut template = Template {
            template_id,
            template_name: template_row.name,
            template_fields: Vec::new(),
        };

        // 查询模板的所有字段
        let fields = sqlx::query!(
            "SELECT name, is_front FROM template_fields WHERE template_id = ? ORDER BY fields_id",
            template_id
        )
        .fetch_all(pool)
        .await?;

        // 收集所有字段
        for field in fields {
            template.template_fields.push((field.name, field.is_front));
        }

        // 添加到结果列表中
        templates.push(template);
    }

    Ok(templates)
}

pub async fn create_template(pool: &SqlitePool, template: &Template) -> Result<u32> {
    // 开启事务
    let mut tx = pool.begin().await?;

    // 插入模板基本信息
    let template_id = sqlx::query!(
        "INSERT INTO templates (name) VALUES (?)",
        template.template_name
    )
    .execute(&mut *tx)
    .await?
    .last_insert_rowid() as u32;

    // 插入模板字段
    for (index, (field_name, is_front)) in template.template_fields.iter().enumerate() {
        let idx = index as u32;
        sqlx::query!(
            "INSERT INTO template_fields (fields_id, template_id, name, is_front) 
            VALUES (?, ?, ?, ?)",
            idx,
            template_id,
            field_name,
            is_front
        )
        .execute(&mut *tx)
        .await?;
    }

    // 提交事务
    tx.commit().await?;

    Ok(template_id)
}

pub async fn parse_template(pool: &SqlitePool, template_id: u32) -> Result<Template> {
    // 首先查询模板基本信息
    let template_row = sqlx::query!(
        "SELECT template_id, name FROM templates WHERE template_id = ?",
        template_id
    )
    .fetch_optional(pool)
    .await?;

    // 如果找不到模板，返回错误
    let template_row = match template_row {
        Some(row) => row,
        None => return Err(sqlx::Error::RowNotFound),
    };

    let mut template = Template {
        template_id: template_row.template_id as u32,
        template_name: template_row.name,
        template_fields: Vec::new(),
    };

    // 查询模板的所有字段
    let fields = sqlx::query!(
        "SELECT name, is_front FROM template_fields WHERE template_id = ? ORDER BY fields_id",
        template_id
    )
    .fetch_all(pool)
    .await?;

    // 收集所有字段
    for field in fields {
        template.template_fields.push((field.name, field.is_front));
    }

    // 如果没有找到任何字段，可能是一个异常情况
    if template.template_fields.is_empty() {
        return Err(sqlx::Error::RowNotFound);
    }

    Ok(template)
}
