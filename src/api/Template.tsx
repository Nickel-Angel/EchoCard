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
