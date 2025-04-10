import { CardData, TemplateData } from "../CardMemoUtils";
import { TemplateInterface, TemplateProps } from "./TemplateInterface";
import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function SelectionCard({
  cardContent,
  handleRating,
  emitCorrect,
  nextIntervals,
}: TemplateProps) {
  // 使用React hooks创建组件状态
  const [showBack, setShowBack] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 将选项文本按换行符分割成数组
  const optionsList = cardContent.options.split("\n");

  // 处理选项点击
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setShowBack(true);
  };

  const isCorrect = (
    rating: number,
    userAnswer?: string | null,
    correctAnswer?: string | null
  ) => {
    // 对于选择题，如果提供了用户答案和正确答案，则直接比较它们是否相等
    if (userAnswer !== undefined && correctAnswer !== undefined) {
      return userAnswer === correctAnswer;
    }
    // 否则回退到基于评分的判断
    return rating > 1;
  };

  // 处理评分，根据用户选择是否正确调整评分
  const handleRatingWithCheck = (baseRating: number) => {
    // 判断用户选择是否正确
    if (isCorrect(baseRating, selectedOption, cardContent.answer)) {
      emitCorrect();
    }
    // 调用原始的handleRating函数
    handleRating(baseRating);
  };

  return (
    <Card>
      <CardContent>
        {/* 问题始终显示 */}
        <Typography variant="h5" component="div" gutterBottom>
          {cardContent.question}
        </Typography>

        {/* 选项始终显示，但可以点击 */}
        <Box sx={{ mb: 2 }}>
          {optionsList.map((option: string, index: number) => {
            return (
              <Button
                key={index}
                variant={selectedOption === option ? "contained" : "outlined"}
                color={selectedOption === option ? "primary" : "inherit"}
                onClick={() => handleOptionClick(option)}
                sx={{
                  display: "block",
                  textAlign: "left",
                  width: "100%",
                  mb: 1,
                  textTransform: "none",
                }}
              >
                <Typography variant="body1" component="div">
                  {option}
                </Typography>
              </Button>
            );
          })}
        </Box>

        {/* 答案和解析仅在显示背面时显示 */}
        {showBack && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              答案: {cardContent.answer}
            </Typography>
            {cardContent.explanation && (
              <Typography variant="body1">
                <strong>解析:</strong> {cardContent.explanation}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ flexDirection: "column", alignItems: "stretch" }}>
        {showBack ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              mb: 1,
            }}
          >
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleRatingWithCheck(1);
              }}
              sx={{ flex: 1, mx: 0.5 }}
            >
              忘记 {nextIntervals?.again ? `(${nextIntervals.again} 天)` : ""}
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleRatingWithCheck(2);
              }}
              sx={{ flex: 1, mx: 0.5 }}
            >
              困难 {nextIntervals?.hard ? `(${nextIntervals.hard} 天)` : ""}
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={() => {
                handleRatingWithCheck(3);
              }}
              sx={{ flex: 1, mx: 0.5 }}
            >
              良好 {nextIntervals?.good ? `(${nextIntervals.good} 天)` : ""}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleRatingWithCheck(4);
              }}
              sx={{ flex: 1, mx: 0.5 }}
            >
              简单 {nextIntervals?.easy ? `(${nextIntervals.easy} 天)` : ""}
            </Button>
          </Box>
        ) : null}
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

    return {
      question:
        questionIndex >= 0 &&
        questionIndex < card.template_fields_content.length
          ? card.template_fields_content[questionIndex]
          : "",
      options:
        optionsIndex >= 0 && optionsIndex < card.template_fields_content.length
          ? card.template_fields_content[optionsIndex]
          : "",
      answer:
        answerIndex >= 0 && answerIndex < card.template_fields_content.length
          ? card.template_fields_content[answerIndex]
          : "",
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
        handleRating={props.handleRating}
        emitCorrect={props.emitCorrect}
        nextIntervals={props.nextIntervals}
      />
    );
  }
}
