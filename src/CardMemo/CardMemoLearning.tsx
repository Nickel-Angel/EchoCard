import { useEffect, useState } from "react";
import CardMemoText from "./CardMemoText";
import { useLocation, useNavigate } from "react-router-dom";
import { createDeckData } from "./CardMemoUtils";

function CardMemoLearning() {
  const location = useLocation();
  const navigate = useNavigate();

  const [deckData, setDeckData] = useState(createDeckData(0, "", 0, 0, 0));

  const [idx, setIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);

  const [currentCard, setCurrentCard] = useState({
    front: "",
    back: "",
  });

  // first render
  useEffect(() => {
    const { deckId, deckName, tolearn, learning, toreview } =
      location.state || {};

    // 设置开始学习时间
    setStartTime(Date.now());

    // TODO: display deck info in text UI
    setDeckData({
      deckId: deckId,
      deckName: deckName,
      tolearn: tolearn,
      learning: learning,
      toreview: toreview,
    });

    // TODO: get first card from back end
    if (tolearn + learning + toreview > 0) {
      setCurrentCard({
        front: `第 ${idx} 张卡片正面`,
        back: `第 ${idx} 张卡片背面`,
      });
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

  // TODO: send rating to back-end and get next card
  const getNextCard = () => {
    if (idx == 2) {
      return null;
    }
    return [`第 ${idx} 张卡片正面`, `第 ${idx} 张卡片背面`];
  };

  // get next card when idx update.
  useEffect(() => {
    const result = getNextCard();
    if (result) {
      setCurrentCard({
        front: result[0],
        back: result[1],
      });
    } else {
      // 计算学习时间（毫秒）
      const endTime = Date.now();
      const totalStudyTime = endTime - startTime;

      navigate("/card-memo-end", {
        state: {
          deckName: deckData.deckName,
          totalCards: deckData.toreview + deckData.learning + deckData.tolearn,
          correctCount: correctCount,
          studyTime: totalStudyTime,
        },
      });
    }
  }, [idx]);

  const handleCardRating = (rating: number) => {
    console.log(`卡片评分: ${rating}`);
    if (rating > 1) {
      // TODO: modify correct standard.
      setCorrectCount(correctCount + 1);
    }
    setIdx(idx + 1);
  };

  return (
    <div>
      <CardMemoText
        frontContent={currentCard.front}
        backContent={currentCard.back}
        handleRating={handleCardRating}
      />
    </div>
  );
}

export default CardMemoLearning;
