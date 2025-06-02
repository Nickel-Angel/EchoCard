import { Box, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  loadCardsFromBackend,
  loadNextState,
  submitCardRating,
  CardData,
  NextIntervals,
} from "@/api/Card";
import { createDeckData } from "@/api/Deck";
import { loadTemplate, TemplateData } from "@/api/Template";
import { TemplateFactory } from "@/CardMemo/templates/TemplateFactory";
import { TemplateInterface } from "@/CardMemo/templates/TemplateInterface";
import RatingButtons from "@/CardMemo/RatingButtons";

function CardMemoLearning() {
  const location = useLocation();
  const navigate = useNavigate();

  const [deckData, setDeckData] = useState(createDeckData(0, "", 0, 0, 0));

  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // 卡片缓存和当前卡片状态
  const [cardCache, setCardCache] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [_, setCurrentTemplate] = useState<TemplateData | null>(null);
  const [nextIntervals, setNextIntervals] = useState<NextIntervals | null>(
    null
  );
  const [__, setIsLoading] = useState(false);

  // 当前使用的模板实例
  const [templateInstance, setTemplateInstance] =
    useState<TemplateInterface | null>(null);

  // 解析后的卡片内容
  const [parsedCardContent, setParsedCardContent] = useState<any>(null);

  // 返回主页的处理函数
  const handleReturnHome = () => {
    // 确认是否要返回主页
    if (window.confirm("确定要返回主页吗？当前学习进度将不会保存。")) {
      navigate("/");
    }
  };

  const processCurrentCard = async () => {
    // 如果没有卡片或已经学习完所有卡片
    if (cardCache.length === 0) {
      return;
    }

    // 如果当前索引超出缓存范围，尝试加载更多卡片
    if (currentCardIndex >= cardCache.length) {
      const hasMoreCards = await loadCardsFromBackend(
        deckData.deckId,
        10,
        setCardCache,
        setCurrentCardIndex,
        setIsLoading
      );
      if (!hasMoreCards) {
        // 没有更多卡片，结束学习
        const endTime = Date.now();
        const totalStudyTime = endTime - startTime;

        navigate("/card-memo-end", {
          state: {
            deckName: deckData.deckName,
            totalCards:
              deckData.toreview + deckData.learning + deckData.tolearn,
            correctCount: correctCount,
            studyTime: totalStudyTime,
          },
        });
        return;
      }
    }

    // 获取当前卡片
    const card = cardCache[currentCardIndex];

    // 加载模板和下一状态
    const template = await loadTemplate(card.template_id, setCurrentTemplate);
    await loadNextState(card, setNextIntervals);

    if (template) {
      // 使用模板工厂创建对应的模板实例
      const instance = await TemplateFactory.createTemplate(template);
      setTemplateInstance(instance);

      // 使用模板实例解析卡片内容
      const content = instance.parseCardContent(card, template);
      setParsedCardContent(content);
    }
  };

  // first render
  useEffect(() => {
    const { deckId, deckName, tolearn, learning, toreview } =
      location.state || {};

    // 设置开始学习时间
    setStartTime(Date.now());

    setDeckData({
      deckId: deckId,
      deckName: deckName,
      tolearn: tolearn,
      learning: learning,
      toreview: toreview,
    });

    // 从后端加载卡片
    if (tolearn + learning + toreview > 0) {
      loadCardsFromBackend(
        deckId,
        10,
        setCardCache,
        setCurrentCardIndex,
        setIsLoading
      );
      return;
    }
    navigate("/card-memo-end", {
      state: {
        deckName: deckName,
        totalCards: 0,
        correctCount: 0,
        studyTime: 0,
      },
    });
  }, []);

  // 处理卡片缓存和当前卡片索引变化
  useEffect(() => {
    processCurrentCard();
  }, [cardCache, currentCardIndex]);

  const handleCardRating = async (rating: number) => {
    console.log(`卡片评分: ${rating}`);

    // 调用 emitCorrect 函数，根据评分判断是否为正确答案
    emitCorrect(rating);

    // 提交评分到后端
    await submitCardRating(rating);

    // 移动到下一张卡片
    setCurrentCardIndex(currentCardIndex + 1);
  };

  // 发出正确答案信号的函数
  const emitCorrect = (rating: number) => {
    // 只有当评分大于1（即不是"忘记"按钮）时才计为正确
    if (rating > 1) {
      setCorrectCount(correctCount + 1);
    }
  };

  return (
    <Box sx={{ minWidth: 320, width: "100%" }}>
      {/* 返回主页按钮 */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleReturnHome}
          size="small"
        >
          返回主页
        </Button>
      </Box>

      {templateInstance && parsedCardContent ? (
        // 使用模板实例渲染卡片
        templateInstance.renderCard({
          cardContent: parsedCardContent,
          emitCorrect,
          ratingButtons: (
            <RatingButtons
              handleRating={handleCardRating}
              nextIntervals={nextIntervals}
            />
          ),
        })
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "200px",
          }}
        >
          加载中...
        </Box>
      )}
    </Box>
  );
}

export default CardMemoLearning;
