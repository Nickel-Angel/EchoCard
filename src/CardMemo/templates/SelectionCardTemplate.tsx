import { CardData } from "@/api/Card";
import { TemplateData } from "@/api/Template";
import {
  TemplateInterface,
  TemplateProps,
} from "@/CardMemo/templates/TemplateInterface";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function SelectionCard({
  cardContent,
  emitCorrect,
  ratingButtons,
}: TemplateProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // 当卡片内容变化时重置状态
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    setIsCorrect(false);
  }, [cardContent]);

  // 处理选项点击
  const handleOptionClick = (index: number) => {
    if (!showAnswer) {
      setSelectedOption(index);
      setIsCorrect(index === cardContent.correctOption);
      setShowAnswer(true);
    }
  };

  return (
    <Card sx={{ width: "100%", maxWidth: 800, mx: "auto", my: 2 }}>
      <CardContent>
        <Typography variant="h5" component="div" gutterBottom>
          {cardContent.question}
        </Typography>

        <Box sx={{ mt: 3 }}>
          {cardContent.options.map((option: string, index: number) => (
            <Button
              key={index}
              variant={selectedOption === index ? "contained" : "outlined"}
              color={
                showAnswer
                  ? index === cardContent.correctOption
                    ? "success"
                    : selectedOption === index
                    ? "error"
                    : "primary"
                  : "primary"
              }
              onClick={() => handleOptionClick(index)}
              sx={{ display: "block", width: "100%", mb: 1, textAlign: "left" }}
              disabled={showAnswer}
            >
              {option}
            </Button>
          ))}
        </Box>

        {showAnswer && (
          <Box sx={{ mt: 3, p: 2, bgcolor: "background.paper" }}>
            <Typography
              variant="h6"
              color={isCorrect ? "success.main" : "error.main"}
              gutterBottom
            >
              {`正确答案: ${String.fromCharCode(
                65 + cardContent.correctOption
              )}`}
            </Typography>
            {cardContent.explanation && (
              <Typography variant="body1">{cardContent.explanation}</Typography>
            )}
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ flexDirection: "column", alignItems: "center" }}>
        {showAnswer && ratingButtons}
      </CardActions>
    </Card>
  );
}

/**
 * 选择题卡片模板实现
 */
export class SelectionCardTemplate extends TemplateInterface {
  /**
   * 解析卡片内容
   * @param card 卡片数据
   * @param template 模板数据
   * @returns 解析后的卡片内容，包含问题、选项、答案和解析
   */
  parseCardContent(card: CardData, template: TemplateData) {
    // 处理选择题卡片
    const questionIndex = template.template_fields.findIndex(
      (f) => f[0] === "问题"
    );
    const optionsIndex = template.template_fields.findIndex(
      (f) => f[0] === "选项"
    );
    const answerIndex = template.template_fields.findIndex(
      (f) => f[0] === "答案"
    );
    const explanationIndex = template.template_fields.findIndex(
      (f) => f[0] === "解析"
    );

    // 获取选项字符串并拆分为数组
    let optionsString = "";
    if (
      optionsIndex >= 0 &&
      optionsIndex < card.template_fields_content.length
    ) {
      optionsString = card.template_fields_content[optionsIndex];
    }

    // 将选项字符串按换行符拆分为数组
    const optionsArray = optionsString
      ? optionsString.split("\n").filter((option) => option.trim() !== "")
      : [];

    // 获取正确答案并转换为选项索引
    let correctOption = 0;
    if (answerIndex >= 0 && answerIndex < card.template_fields_content.length) {
      const answerText = card.template_fields_content[answerIndex];
      // 尝试将答案转换为数字索引，如果失败则默认为0
      const parsedIndex = parseInt(answerText);
      if (
        !isNaN(parsedIndex) &&
        parsedIndex >= 0 &&
        parsedIndex < optionsArray.length
      ) {
        correctOption = parsedIndex;
      }
    }

    return {
      question:
        questionIndex >= 0 &&
        questionIndex < card.template_fields_content.length
          ? card.template_fields_content[questionIndex]
          : "",
      options: optionsArray,
      correctOption: correctOption,
      explanation:
        explanationIndex >= 0 &&
        explanationIndex < card.template_fields_content.length
          ? card.template_fields_content[explanationIndex]
          : "",
    };
  }

  /**
   * 渲染卡片组件
   * @param cardContent 解析后的卡片内容
   * @param handleRating 评分处理函数
   * @param nextIntervals 下一个间隔状态
   * @returns JSX元素
   */
  renderCard(props: TemplateProps): JSX.Element {
    return (
      <SelectionCard
        cardContent={props.cardContent}
        emitCorrect={props.emitCorrect}
        ratingButtons={props.ratingButtons}
      />
    );
  }
}
