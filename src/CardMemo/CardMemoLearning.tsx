import { useEffect, useState } from "react";
import CardMemoText from "./CardMemoText";
import { useLocation, useNavigate } from "react-router-dom";
import {
  createDeckData,
  loadCardsFromBackend,
  loadTemplate,
  loadNextState,
  submitCardRating,
  CardData,
  TemplateData,
  NextIntervals,
} from "./CardMemoUtils";

function CardMemoLearning() {
  const location = useLocation();
  const navigate = useNavigate();

  const [deckData, setDeckData] = useState(createDeckData(0, "", 0, 0, 0));

  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // 卡片缓存和当前卡片状态
  const [cardCache, setCardCache] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentTemplate, setCurrentTemplate] = useState<TemplateData | null>(
    null
  );
  const [nextIntervals, setNextIntervals] = useState<NextIntervals | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const [currentCard, setCurrentCard] = useState({
    front: "",
    back: "",
  });

  // 函数已移至CardMemoUtils.tsx

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
        // 根据模板构建卡片内容
        const frontFields = template.template_fields
          .filter((field) => field[1]) // 筛选前面字段
          .map((field) => {
            const fieldIndex = template.template_fields.findIndex(
              (f) => f[0] === field[0]
            );
            return fieldIndex >= 0 &&
              fieldIndex < card.template_fields_content.length
              ? card.template_fields_content[fieldIndex]
              : "";
          });

        const backFields = card.template_fields_content;

        setCurrentCard({
          front: frontFields.join("\n"),
          back: backFields.join("\n"),
        });
      }
    };

    processCurrentCard();
  }, [cardCache, currentCardIndex]);

  const handleCardRating = async (rating: number) => {
    console.log(`卡片评分: ${rating}`);

    // 提交评分到后端
    await submitCardRating(rating);

    if (rating > 1) {
      setCorrectCount(correctCount + 1);
    }

    // 移动到下一张卡片
    setCurrentCardIndex(currentCardIndex + 1);
  };

  return (
    <div>
      <CardMemoText
        frontContent={currentCard.front}
        backContent={currentCard.back}
        handleRating={handleCardRating}
        nextIntervals={nextIntervals}
      />
    </div>
  );
}

export default CardMemoLearning;
