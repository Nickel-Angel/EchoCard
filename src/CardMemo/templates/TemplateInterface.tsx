import { CardData, NextIntervals } from "@/api/Card";
import { TemplateData } from "@/api/Template";

export interface TemplateProps {
  cardContent: any;
  handleRating: (rating: number) => void;
  emitCorrect: () => void;
  nextIntervals: NextIntervals | null;
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
   * @param handleRating 评分处理函数
   * @param nextIntervals 下一个间隔状态
   * @returns JSX元素
   */
  abstract renderCard(props: TemplateProps): JSX.Element;
}
