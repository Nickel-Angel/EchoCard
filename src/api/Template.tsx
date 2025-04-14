import { invoke } from "@tauri-apps/api/core";

export interface TemplateData {
  template_id: number;
  template_name: string;
  template_fields: [string, boolean][];
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
