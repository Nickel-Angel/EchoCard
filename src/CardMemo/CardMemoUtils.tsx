import { invoke } from "@tauri-apps/api/core";

export interface DeckData {
  deckId: number;
  deckName: string;
  tolearn: number;
  learning: number;
  toreview: number;
}

export function createDeckData(
  deckId: number,
  deckName: string,
  tolearn: number,
  learning: number,
  toreview: number
): DeckData {
  return { deckId, deckName, tolearn, learning, toreview };
}

export async function fetchDecks(
  setRows: React.Dispatch<React.SetStateAction<DeckData[]>>
) {
  try {
    const decks = await invoke<any[]>("decks_display");
    const deckData = decks.map((deck: any) =>
      createDeckData(
        deck.deck_id,
        deck.deck_name,
        deck.tolearn,
        deck.learning,
        deck.reviewing
      )
    );
    setRows(deckData);
  } catch (error) {
    console.error("获取牌组信息失败:", error);
  }
}

export async function fetchLearningCount(
  setLearningNumber: React.Dispatch<React.SetStateAction<number>>
) {
  try {
    const count = await invoke<number>("card_count_learned_today");
    setLearningNumber(count);
  } catch (error) {
    console.error("获取学习数量失败:", error);
  }
}
