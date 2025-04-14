// 重新导出从api目录移动的类型和函数
import { DeckData, createDeckData, fetchDecks, deleteDeck } from "../api/Deck";
import {
  CardData,
  TemplateData,
  NextIntervals,
  fetchLearningCount,
  loadCardsFromBackend,
  loadTemplate,
  loadNextState,
  submitCardRating,
} from "../api/Card";

// 导出所有类型和函数，保持向后兼容性
export type { DeckData, CardData, TemplateData, NextIntervals };

export {
  createDeckData,
  fetchDecks,
  fetchLearningCount,
  loadCardsFromBackend,
  loadTemplate,
  loadNextState,
  submitCardRating,
  deleteDeck,
};
