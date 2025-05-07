use crate::models::Template;
use crate::models::TemplateField;
use sqlx::{Result, SqlitePool};

/// 根据模板ID或名称获取模板信息
///
/// # 参数
/// * `pool` - 数据库连接池
/// * `identifier` - 模板标识符，可以是ID或名称
///
/// # 返回值
/// * `Result<Option<Template>>` - 如果找到模板则返回Some(Template)，否则返回None
pub async fn get_template(
    pool: &SqlitePool,
    identifier: impl Into<TemplateIdentifier<'_>>,
) -> Result<Option<Template>> {
    let identifier = identifier.into();

    // 根据标识符类型构建查询
    let template_row = match identifier {
        TemplateIdentifier::Id(id) => {
            let row = sqlx::query!(
                "SELECT template_id, name FROM templates WHERE template_id = ?",
                id
            )
            .fetch_optional(pool)
            .await?;

            // 转换为Option<(i64, String)>格式
            row.map(|r| (r.template_id, r.name))
        }
        TemplateIdentifier::Name(name) => {
            let row = sqlx::query!(
                "SELECT template_id, name FROM templates WHERE name = ?",
                name
            )
            .fetch_optional(pool)
            .await?;

            // 转换为Option<(i64, String)>格式
            row.map(|r| (r.template_id, r.name))
        }
    };

    // 如果找不到模板，返回None
    let (template_id, template_name) = match template_row {
        Some(row) => row,
        None => return Ok(None),
    };

    let template_id = template_id as u32;
    let mut template = Template {
        template_id,
        template_name: template_name,
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

/// 模板标识符枚举，用于支持通过ID或名称查询模板
pub enum TemplateIdentifier<'a> {
    Id(u32),
    Name(&'a str),
}

impl From<u32> for TemplateIdentifier<'_> {
    fn from(id: u32) -> Self {
        TemplateIdentifier::Id(id)
    }
}

impl<'a> From<&'a str> for TemplateIdentifier<'a> {
    fn from(name: &'a str) -> Self {
        TemplateIdentifier::Name(name)
    }
}

// 为了向后兼容，保留原函数但内部调用新函数
pub async fn get_template_by_id(pool: &SqlitePool, template_id: u32) -> Result<Option<Template>> {
    get_template(pool, template_id).await
}

pub async fn get_template_by_name(
    pool: &SqlitePool,
    template_name: &str,
) -> Result<Option<Template>> {
    get_template(pool, template_name).await
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

pub async fn get_template_fields(
    pool: &SqlitePool,
    template_id: u32,
) -> Result<Vec<TemplateField>> {
    let fields = sqlx::query!(
        "SELECT fields_id, template_id, name, is_front 
        FROM template_fields 
        WHERE template_id =? ORDER BY fields_id",
        template_id
    )
    .fetch_all(pool)
    .await?;

    let mut template_fields = Vec::new();

    for field in fields {
        template_fields.push(TemplateField {
            field_id: field.fields_id as u32,
            template_id: field.template_id as u32,
            name: field.name,
            is_front: field.is_front,
        });
    }

    Ok(template_fields)
}
