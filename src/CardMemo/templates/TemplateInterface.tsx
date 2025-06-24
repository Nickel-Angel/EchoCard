import { CardData } from "@/api/Card";
import { TemplateData } from "@/api/Template";

export interface TemplateProps {
  cardContent: any; // 解析后的卡片内容
  emitCorrect: (rating: number) => void; // 评分处理函数
  ratingButtons?: React.ReactNode; // 自定义评分按钮
}

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
