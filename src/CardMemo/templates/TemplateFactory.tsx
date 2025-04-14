import { TemplateData } from "@/api/Template";
import { TemplateInterface } from "@/CardMemo/templates/TemplateInterface";
import { TextCardTemplate } from "@/CardMemo/templates/TextCardTemplate";
import { SelectionCardTemplate } from "@/CardMemo/templates/SelectionCardTemplate";

/**
 * 模板工厂类，用于创建不同类型的模板实例
 */
export class TemplateFactory {
  /**
   * 根据模板数据创建对应的模板实例
   * @param template 模板数据
   * @returns 模板实例
   */
  static createTemplate(template: TemplateData): TemplateInterface {
    // 根据模板名称创建对应的模板实例
    switch (template.template_name) {
      case "选择题卡片":
        return new SelectionCardTemplate();
      default:
        // 默认使用文本卡片模板
        return new TextCardTemplate();
    }
  }
}
