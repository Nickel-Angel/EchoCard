import { CardData } from "@/api/Card";
import { TemplateData } from "@/api/Template";

export interface TemplateProps {
  cardContent: any;
  emitCorrect: (rating: number) => void;
  ratingButtons?: React.ReactNode; // 可选的评分按钮组件
}

/**
 * 模板抽象类，定义所有模板组件需要实现的方法
 */
export abstract class TemplateInterface {
  /**
   * 解析卡片内容
   * @param card 卡片数据
   * @param template 模板数据
   * @returns 解析后的卡片内容
   */
  abstract parseCardContent(card: CardData, template: TemplateData): any;

  /**
   * 渲染卡片组件
   * @param cardContent 解析后的卡片内容
   * @param emitCorrect 评分处理函数
   * @returns JSX元素
   */
  abstract renderCard(props: TemplateProps): JSX.Element;
}
