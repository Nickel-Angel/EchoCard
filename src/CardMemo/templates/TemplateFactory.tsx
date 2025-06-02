import {
  TemplateData,
  getTemplateConfig,
  TemplateConfigData,
} from "@/api/Template";
import { TemplateInterface } from "@/CardMemo/templates/TemplateInterface";
import { TextCardTemplate } from "@/CardMemo/templates/TextCardTemplate";
import { SelectionCardTemplate } from "@/CardMemo/templates/SelectionCardTemplate";

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
   * 根据模板数据创建对应的模板实例
   * @param template 模板数据
   * @returns 模板实例
   */
  static async createTemplate(
    template: TemplateData
  ): Promise<TemplateInterface> {
    // 确保模板配置已初始化
    const config = await this.getTemplateConfig();

    // 从配置中查找模板名称对应的类名
    const templateInfo = config.templates.find(
      (t) => t.templateName === template.template_name
    );

    // 如果找到对应的模板信息，则创建对应的模板实例
    if (templateInfo && this.templateClassMap[templateInfo.className]) {
      return new this.templateClassMap[templateInfo.className]();
    }

    // 默认使用文本卡片模板
    return new TextCardTemplate();
  }
}
