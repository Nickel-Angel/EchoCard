import { invoke } from "@tauri-apps/api/core";

export interface DeckData {
  deckId: number;
  deckName: string;
  tolearn: number;
  learning: number;
  toreview: number;
}

export interface CardData {
  card_id: number;
  template_id: number;
  template_fields_content: string[];
  due: string;
  memory_state: [number, number] | null;
  scheduled_days: number;
  last_review: string | null;
}

export interface TemplateData {
  template_id: number;
  template_name: string;
  template_fields: [string, boolean][];
}

export interface NextIntervals {
  again: number;
  hard: number;
  good: number;
  easy: number;
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
 * 获取今日已学习的卡片数量
 * @param setLearningNumber - React状态更新函数，用于更新学习数量
 * @returns void - 无返回值，通过setLearningNumber更新状态
 * @description 调用后端的card_count_learned_today命令获取今日已学习的卡片总数
 */
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

/**
 * 从后端加载卡片
 * @param deckId - 牌组ID，指定从哪个牌组加载卡片
 * @param pageSize - 一次加载的卡片数量，默认为10
 * @param setCardCache - React状态更新函数，用于更新卡片缓存
 * @param setCurrentCardIndex - React状态更新函数，用于重置当前卡片索引
 * @param setIsLoading - React状态更新函数，用于更新加载状态
 * @returns Promise<boolean> - 返回是否成功加载到卡片，true表示成功加载且有卡片，false表示加载失败或无卡片
 * @description 调用后端的get_next_card命令获取指定牌组的下一批待学习卡片
 */
export async function loadCardsFromBackend(
  deckId: number,
  pageSize: number = 10,
  setCardCache: React.Dispatch<React.SetStateAction<CardData[]>>,
  setCurrentCardIndex: React.Dispatch<React.SetStateAction<number>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    setIsLoading(true);
    const cards = await invoke<CardData[]>("get_next_card", {
      deckId,
      pageSize,
    });
    setCardCache(cards);
    setCurrentCardIndex(0);
    setIsLoading(false);
    return cards.length > 0;
  } catch (error) {
    console.error("加载卡片失败:", error);
    setIsLoading(false);
    return false;
  }
}

/**
 * 加载当前卡片的模板
 * @param templateId - 模板ID，指定要加载的模板
 * @param setCurrentTemplate - React状态更新函数，用于更新当前模板
 * @returns Promise<TemplateData | null> - 返回加载的模板数据，加载失败时返回null
 * @description 调用后端的get_loaded_template命令获取指定ID的卡片模板信息，包括模板字段和显示规则
 */
export async function loadTemplate(
  templateId: number,
  setCurrentTemplate: React.Dispatch<React.SetStateAction<TemplateData | null>>
) {
  try {
    const template = await invoke<TemplateData>("get_loaded_template", {
      templateId,
    });
    setCurrentTemplate(template);
    return template;
  } catch (error) {
    console.error("加载模板失败:", error);
    return null;
  }
}

/**
 * 加载卡片的下一个间隔状态
 * @param card - 当前卡片数据
 * @param setNextIntervals - React状态更新函数，用于更新下一个间隔状态
 * @returns Promise<NextIntervals | null> - 返回下一个间隔状态，加载失败时返回null
 * @description 调用后端的load_next_state命令计算卡片在不同评分下的下一个复习间隔，包括again、hard、good和easy四种评分对应的天数
 */
export async function loadNextState(
  card: CardData,
  setNextIntervals: React.Dispatch<React.SetStateAction<NextIntervals | null>>
) {
  try {
    const intervals = await invoke<NextIntervals>("load_next_state", {
      card,
    });
    setNextIntervals(intervals);
    return intervals;
  } catch (error) {
    console.error("加载下一状态失败:", error);
    return null;
  }
}

/**
 * 提交卡片评分
 * @param rating - 评分值，表示用户对卡片的评价（通常为0-3的整数，对应again、hard、good、easy）
 * @returns Promise<boolean> - 返回是否成功提交评分，true表示成功，false表示失败
 * @description 调用后端的emit_card_review命令提交用户对当前卡片的评分，用于更新卡片的记忆状态和下次复习时间
 */
export async function submitCardRating(rating: number) {
  try {
    await invoke("emit_card_review", { rating });
    return true;
  } catch (error) {
    console.error("提交评分失败:", error);
    return false;
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
