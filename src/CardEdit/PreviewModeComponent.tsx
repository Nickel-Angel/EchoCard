import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// 定义卡片数据接口
interface CardData {
  cardId: number;
  content: string; // 卡片完整内容
  summary: string; // 卡片概要，从卡片内容中提取的前几个字符
  template: string;
  deckName: string;
}

/**
 * 预览模式组件
 * @param card - 卡片数据
 * @returns 预览模式组件
 */
const PreviewModeComponent = ({ card }: { card: CardData | null }) => {
  if (!card) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.paper",
          borderRadius: 1,
          p: 2,
          boxShadow: 1,
        }}
      >
        <p>请选择一张卡片进行预览</p>
      </Box>
    );
  }

  // 根据卡片所属牌组和模板类型生成相应内容
  const cardContent = (() => {
    // 文本卡片模板
    if (card.template === "正反面卡片") {
      if (card.deckName === "英语单词") {
        return {
          front: `${card.content} (英语单词)`,
          back: `释义：这是一个英语单词的释义
例句：This is an example sentence using the word ${card.content}.`,
        };
      } else if (card.deckName === "数学公式") {
        return {
          front: `请说出以下数学概念的定义：${card.content}`,
          back: `${card.content}的定义：
这是一个重要的数学概念，用于解决特定类型的问题。`,
        };
      } else {
        return {
          front: `${card.content} (${card.deckName})`,
          back: `这是关于${card.deckName}中${card.content}的详细解释。`,
        };
      }
    }
    // 选择题卡片模板
    else {
      if (card.deckName === "历史事件") {
        return {
          question: `下列哪一项正确描述了${card.content}这一历史事件？`,
          options: `选项A: ${card.content}发生于20世纪初
选项B: ${card.content}与工业革命有关
选项C: ${card.content}导致了重大社会变革`,
          answer: "选项C: ${card.content}导致了重大社会变革",
          explanation: `${card.content}是一个重要的历史转折点，它确实导致了社会结构的显著变化。`,
        };
      } else if (card.deckName === "编程概念") {
        return {
          question: `在编程中，${card.content}的主要作用是什么？`,
          options: `选项A: 提高代码执行效率
选项B: 简化复杂的数据结构
选项C: 实现代码复用`,
          answer: "选项A: 提高代码执行效率",
          explanation: `${card.content}通常用于优化算法，减少计算资源的消耗，从而提高程序的整体性能。`,
        };
      } else if (card.deckName === "地理知识") {
        return {
          question: `关于${card.content}，下列说法正确的是：`,
          options: `选项A: 位于北半球
选项B: 是世界上最大的大洲
选项C: 拥有多样的气候带`,
          answer: "选项C: 拥有多样的气候带",
          explanation: `${card.content}由于其广阔的地理范围，跨越了多个纬度，因此形成了从热带到寒带的多样气候带。`,
        };
      } else {
        return {
          question: `关于${card.deckName}中的${card.content}，以下哪项是正确的？`,
          options: `选项A: ${card.content}的第一个特性
选项B: ${card.content}的第二个特性
选项C: ${card.content}的第三个特性`,
          answer: "选项A: ${card.content}的第一个特性",
          explanation: `${card.content}的第一个特性是最基本也是最重要的，它定义了${card.content}在${card.deckName}领域中的核心价值。`,
        };
      }
    }
  })();

  const [showBack, setShowBack] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // 处理选项点击（仅用于选择题卡片）
  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setShowBack(true);
  };

  // 处理显示背面（仅用于文本卡片）
  const handleToggleContent = () => {
    setShowBack(!showBack);
  };

  return (
    <Box
      sx={{
        height: "95%",
        bgcolor: "background.paper",
        borderRadius: 1,
        p: 2,
        boxShadow: 1,
        overflow: "auto",
      }}
    >
      <Card>
        <CardContent>
          {card.template === "文本卡片" ? (
            // 文本卡片模板
            <>
              <Typography
                variant="h5"
                component="div"
                gutterBottom
                sx={{ whiteSpace: "pre-line" }} // 保留换行符
              >
                {cardContent.front}
              </Typography>
              {showBack && (
                <Box
                  sx={{ my: 2, borderTop: 1, borderColor: "divider", pt: 2 }}
                >
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ whiteSpace: "pre-line" }} // 保留换行符
                  >
                    {cardContent.back}
                  </Typography>
                </Box>
              )}
              {!showBack && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleToggleContent}
                    fullWidth
                  >
                    显示背面
                  </Button>
                </Box>
              )}
            </>
          ) : (
            // 选择题卡片模板
            <>
              {/* 问题始终显示 */}
              {cardContent.question && (
                <Typography variant="h5" component="div" gutterBottom>
                  {cardContent.question}
                </Typography>
              )}

              {/* 选项始终显示，但可以点击 */}
              <Box sx={{ mb: 2 }}>
                {cardContent.options &&
                  cardContent.options
                    .split("\n")
                    .map((option: string, index: number) => {
                      return (
                        <Button
                          key={index}
                          variant={
                            selectedOption === option ? "contained" : "outlined"
                          }
                          color={
                            selectedOption === option ? "primary" : "inherit"
                          }
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
              {showBack && cardContent.answer && (
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
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PreviewModeComponent;
