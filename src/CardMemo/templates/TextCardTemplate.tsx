import { CardData } from "@/api/Card";
import { TemplateData } from "@/api/Template";
import {
  TemplateInterface,
  TemplateProps,
} from "@/CardMemo/templates/TemplateInterface";
import { useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { RatingButtons } from "./RatingButtons";

function TextCard({
  cardContent,
  handleRating,
  emitCorrect,
  nextIntervals,
}: TemplateProps) {
  // 使用React hooks管理状态
  const [showBack, setShowBack] = useState(false);

  const handleToggleContent = () => {
    setShowBack(!showBack);
  };

  const isCorrect = (rating: number): boolean => {
    return rating > 1;
  };

  const handleRatingWithCheck = (baseRating: number) => {
    // 判断用户选择是否正确
    if (isCorrect(baseRating)) {
      emitCorrect();
    }
    // 调用原始的handleRating函数
    handleRating(baseRating);
  };

  return (
    <Card>
      <CardContent>
        <Typography
          variant="h5"
          component="div"
          sx={{ whiteSpace: "pre-line" }} // 保留换行符
        >
          {cardContent.front}
        </Typography>
        {showBack && (
          <>
            <Box sx={{ my: 2, borderTop: 1, borderColor: "divider", pt: 2 }}>
              <Typography
                variant="h5"
                component="div"
                sx={{ whiteSpace: "pre-line" }} // 保留换行符
              >
                {cardContent.back}
              </Typography>
            </Box>
          </>
        )}
      </CardContent>
      <CardActions sx={{ flexDirection: "column", alignItems: "stretch" }}>
        {showBack ? (
          <RatingButtons
            handleRating={handleRatingWithCheck}
            nextIntervals={nextIntervals}
          />
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleToggleContent}
            fullWidth
          >
            显示背面
          </Button>
        )}
      </CardActions>
    </Card>
  );
}

/**
 * 文本卡片模板实现
 */
export class TextCardTemplate extends TemplateInterface {
  /**
   * 解析卡片内容
   * @param card 卡片数据
   * @param template 模板数据
   * @returns 解析后的卡片内容，包含前面和背面内容
   */
  parseCardContent(card: CardData, template: TemplateData) {
    // 处理普通卡片
    // 筛选前面字段并获取其内容
    const frontFieldsInfo = template.template_fields.filter(
      (field) => field[1]
    ); // 筛选前面字段

    const frontFields = frontFieldsInfo.map((field) => {
      const fieldIndex = template.template_fields.findIndex(
        (f) => f[0] === field[0]
      );
      return fieldIndex >= 0 && fieldIndex < card.template_fields_content.length
        ? card.template_fields_content[fieldIndex]
        : "";
    });

    // 筛选背面字段（非前面字段）并获取其内容
    const backFieldsInfo = template.template_fields.filter(
      (field) => !field[1]
    ); // 筛选非前面字段

    const backFields = backFieldsInfo
      .map((field) => {
        const fieldIndex = template.template_fields.findIndex(
          (f) => f[0] === field[0]
        );
        return fieldIndex >= 0 &&
          fieldIndex < card.template_fields_content.length
          ? `${field[0]}: ${card.template_fields_content[fieldIndex]}`
          : "";
      })
      .filter((content) => content !== ""); // 过滤掉空内容

    return {
      front: frontFields.join("\n"),
      back: backFields.join("\n"),
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
      <TextCard
        cardContent={props.cardContent}
        handleRating={props.handleRating}
        emitCorrect={props.emitCorrect}
        nextIntervals={props.nextIntervals}
      />
    );
  }
}
