import {
  TemplateData,
  getTemplateConfig,
  TemplateConfigData,
} from "@/api/Template";
import { TemplateInterface } from "@/CardMemo/templates/TemplateInterface";
import { TextCardTemplate } from "@/CardMemo/templates/TextCardTemplate";
import { SelectionCardTemplate } from "@/CardMemo/templates/SelectionCardTemplate";
import { SpellingCardTemplate } from "@/CardMemo/templates/SpellingCardTemplate";

// 定义模板类映射类型
type TemplateClassMap = {
  [key: string]: new () => TemplateInterface;
};

/**
 * 模板工厂类，用于创建不同类型的模板实例
 */
export class TemplateFactory {
  // 存储模板名称到模板类的映射
  private static templateClassMap: TemplateClassMap = {
    SelectionCardTemplate: SelectionCardTemplate,
    TextCardTemplate: TextCardTemplate,
    SpellingCardTemplate: SpellingCardTemplate,
  };

  // 存储模板配置信息
  private static templateConfig: TemplateConfigData | null = null;

  /**
   * 初始化模板配置
   */
  static async initTemplateConfig(): Promise<void> {
    try {
      this.templateConfig = await getTemplateConfig();
    } catch (error) {
      console.error("初始化模板配置失败:", error);
      // 设置默认配置
      this.templateConfig = {
        templates: [
          {
            templateName: "选择题卡片",
            className: "SelectionCardTemplate",
            importPath: "@/CardMemo/templates/SelectionCardTemplate",
          },
          {
            templateName: "正反面卡片",
            className: "TextCardTemplate",
            importPath: "@/CardMemo/templates/TextCardTemplate",
          },
        ],
      };
    }
  }

  /**
   * 获取模板配置
   */
  static async getTemplateConfig(): Promise<TemplateConfigData> {
    if (!this.templateConfig) {
      await this.initTemplateConfig();
    }
    return this.templateConfig!;
  }

  /**
   * 刷新模板配置，强制从后端重新获取最新的模板配置
   * 在添加新模板后应调用此方法以确保配置是最新的
   */
  static async refreshTemplateConfig(): Promise<void> {
    try {
      this.templateConfig = await getTemplateConfig();
      console.log("模板配置已刷新");
    } catch (error) {
      console.error("刷新模板配置失败:", error);
      throw error;
    }
  }

  /**
   * 清除缓存的模板配置，下次获取时将重新从后端加载
   */
  static clearTemplateConfigCache(): void {
    this.templateConfig = null;
    console.log("模板配置缓存已清除");
  }

  /**
   * 根据模板数据创建对应的模板实例
   * @param template 模板数据
   * @param forceRefresh 是否强制刷新配置（在添加新模板后建议设为true）
   * @returns 模板实例
   */
  static async createTemplate(
    template: TemplateData,
    forceRefresh: boolean = true
  ): Promise<TemplateInterface> {
    // 如果需要强制刷新，则重新获取配置
    if (forceRefresh) {
      await this.refreshTemplateConfig();
    }

    // 确保模板配置已初始化
    const config = await this.getTemplateConfig();
    console.log("config", config); // Add this line to log the config information
    console.log("template", template); // Add this line to log the template information
    // 从配置中查找模板名称对应的类名
    const templateInfo = config.templates.find(
      (t) => t.templateName === template.template_name
    );
    console.log("templateInfo", templateInfo); // Add this line to log the templateInfo information

    // 如果找到对应的模板信息，则创建对应的模板实例
    if (templateInfo && this.templateClassMap[templateInfo.className]) {
      return new this.templateClassMap[templateInfo.className]();
    }

    // 如果没有找到对应的模板，可能是新添加的模板，尝试刷新配置后再次查找
    if (!templateInfo && !forceRefresh) {
      console.log(
        `未找到模板 "${template.template_name}"，尝试刷新配置后重新查找`
      );
      return await this.createTemplate(template, true);
    }

    // 默认使用文本卡片模板
    console.warn(
      `模板 "${template.template_name}" 未找到对应的实现，使用默认文本卡片模板`
    );
    return new TextCardTemplate();
  }
}
