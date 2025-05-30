import { TemplateData } from "@/api/Template";
import { TemplateInterface } from "@/CardMemo/templates/TemplateInterface";
import { TextCardTemplate } from "@/CardMemo/templates/TextCardTemplate";
import { SelectionCardTemplate } from "@/CardMemo/templates/SelectionCardTemplate";
import templateConfig from "@/CardMemo/templates/templateConfig.json";

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

  /**
   * 根据模板数据创建对应的模板实例
   * @param template 模板数据
   * @returns 模板实例
   */
  static createTemplate(template: TemplateData): TemplateInterface {
    // 从配置文件中查找模板名称对应的类名
    const templateInfo = templateConfig.templates.find(
      (t: any) => t.templateName === template.template_name
    );

    // 如果找到对应的模板信息，则创建对应的模板实例
    if (templateInfo && this.templateClassMap[templateInfo.className]) {
      return new this.templateClassMap[templateInfo.className]();
    }

    // 默认使用文本卡片模板
    return new TextCardTemplate();
  }
}
