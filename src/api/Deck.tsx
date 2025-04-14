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

/**
 * 从后端获取所有牌组信息
 * @param setRows - React状态更新函数，用于更新牌组数据列表
 * @returns void - 无返回值，通过setRows更新状态
 * @description 调用后端的decks_display命令获取所有牌组信息，包括每个牌组的ID、名称、待学习卡片数、学习中卡片数和待复习卡片数
 */
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
        deck.toreview
      )
    );
    setRows(deckData);
  } catch (error) {
    console.error("获取牌组信息失败:", error);
  }
}

/**
 * 删除卡组
 * @param deckId - 要删除的卡组ID
 * @returns Promise<boolean> - 返回是否成功删除卡组，true表示成功，false表示失败
 * @description 调用后端的delete_deck命令删除指定ID的卡组
 */
export async function deleteDeck(deckId: number) {
  try {
    await invoke("delete_deck", { deckId });
    return true;
  } catch (error) {
    console.error("删除卡组失败:", error);
    return false;
  }
}
