import { invoke } from "@tauri-apps/api/core";

export interface TemplateData {
  template_id: number;
  template_name: string;
  template_fields: [string, boolean][];
}

export interface TemplateFieldData {
  field_id: number;
  template_id: number;
  name: string;
  is_front: boolean;
}

/**
 * 模板配置信息接口
 */
export interface TemplateConfigData {
  templates: TemplateInfoData[];
}

/**
 * 模板信息接口
 */
export interface TemplateInfoData {
  templateName: string;
  className: string;
  importPath: string;
}

/**
 * 获取所有可用的模板
 * @returns Promise<{id: number, name: string}[]> - 返回所有模板的简要信息列表
 * @description 调用后端cardedit.rs中的template_display命令获取所有可用的卡片模板
 */
export async function getAllTemplates(): Promise<
  { id: number; name: string }[]
> {
  try {
    const templates = await invoke<TemplateData[]>("template_display");
    return templates.map((template) => ({
      id: template.template_id,
      name: template.template_name,
    }));
  } catch (error) {
    console.error("获取所有模板失败:", error);
    return [];
  }
}

/**
 * 获取特定模板的所有字段
 * @returns Promise<TemplateFieldData[]> - 返回所有字段
 * @description 调用后端cardedit.rs中的get_fields命令获取所有可用的卡片模板
 */
export async function getTemplateFields(
  templateId: number
): Promise<TemplateFieldData[]> {
  try {
    const templateFields = await invoke<TemplateFieldData[]>("get_fields", {
      templateId,
    });
    return templateFields;
  } catch (error) {
    console.error("获取模板字段失败:", error);
    return [];
  }
}

/**
 * 获取模板配置信息
 * @returns Promise<TemplateConfigData> - 返回模板配置信息
 * @description 调用后端cardedit.rs中的get_template_config命令获取模板配置信息
 */
export async function getTemplateConfig(): Promise<TemplateConfigData> {
  try {
    const config = await invoke<TemplateConfigData>("get_template_config");
    return config;
  } catch (error) {
    console.error("获取模板配置失败:", error);
    throw error;
  }
}

/**
 * 加载当前卡片的模板
 * @param templateId - 模板ID，指定要加载的模板
 * @param setCurrentTemplate - React状态更新函数，用于更新当前模板
 * @returns Promise<TemplateData | null> - 返回加载的模板数据，加载失败时返回null
 * @description 调用后端的get_loaded_template命令获取指定ID的卡片模板信息，包括模板字段和显示规则
 */
export async function loadTemplate(
  templateId: number,
  setCurrentTemplate: React.Dispatch<React.SetStateAction<TemplateData | null>>
) {
  try {
    const template = await invoke<TemplateData>("get_loaded_template", {
      templateId,
    });
    setCurrentTemplate(template);
    return template;
  } catch (error) {
    console.error("加载模板失败:", error);
    return null;
  }
}

/**
 * 添加新的模板
 * @param templateName - 模板名称
 * @param templateFields - 模板字段列表，每个字段包含名称和是否为正面
 * @param className - 模板类名，用于在TemplateFactory中创建模板实例
 * @param importPath - 模板导入路径，用于在TemplateFactory中导入模板类
 * @returns Promise<{success: boolean, message: string, templateId?: number}> - 返回添加结果
 * @description 1. 调用后端add_template_config API更新模板配置
 *              2. 调用后端add_template API将模板数据写入数据库
 */
export async function addTemplate(
  templateName: string,
  templateFields: [string, boolean][],
  className: string,
  importPath: string
): Promise<{ success: boolean; message: string; templateId?: number }> {
  try {
    // 1. 调用后端add_template_config API更新模板配置
    await invoke("add_template_config", {
      templateName,
      className,
      importPath,
    });

    // 2. 调用后端add_template API将模板数据写入数据库
    const template = {
      template_id: 0, // 后端会自动分配ID
      template_name: templateName,
      template_fields: templateFields,
    };

    const templateId = await invoke<number>("add_template", { template });

    return {
      success: true,
      message: `模板 "${templateName}" 添加成功！`,
      templateId,
    };
  } catch (error) {
    console.error("添加模板失败:", error);
    return {
      success: false,
      message: `添加模板失败: ${error}`,
    };
  }
}
