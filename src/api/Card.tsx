import { invoke } from "@tauri-apps/api/core";

export interface CardData {
  card_id: number;
  deck_id: number;
  template_id: number;
  template_fields_content: string[];
  due: string;
  memory_state: [number, number] | null;
  scheduled_days: number;
  last_review: string | null;
}

export interface DeckData {
  deckId: number;
  deckName: string;
  tolearn: number;
  learning: number;
  toreview: number;
}

export interface NextIntervals {
  again: number;
  hard: number;
  good: number;
  easy: number;
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
 * 添加新卡片
 * @param cardData - 新卡片数据，包含牌组ID、模板ID和字段内容
 * @returns Promise<number | null> - 返回新添加卡片的ID，添加失败时返回null
 * @description 调用后端cardedit.rs中的add_card命令添加新卡片到指定牌组
 */
export async function addNewCard(cardData: {
  deckId: number;
  templateId: number;
  templateFields: string[];
}) {
  try {
    // 使用cardedit.rs中的add_card接口，该接口返回新卡片的ID
    const cardId = await invoke<number>("add_card", cardData);
    return cardId;
  } catch (error) {
    console.error("添加卡片失败:", error);
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
 * 根据筛选条件获取卡片列表
 * @param templateIds - 模板ID列表，用于筛选特定模板的卡片
 * @param deckIds - 牌组ID列表，用于筛选特定牌组的卡片
 * @param statusBitFilter - 状态位过滤器，用于筛选特定学习状态的卡片
 * @returns Promise<CardData[] | null> - 返回筛选后的卡片列表，筛选失败时返回null
 * @description 调用后端cardedit.rs中的card_filter命令根据模板ID、牌组ID和状态位过滤器筛选卡片
 */
export async function filterCards(
  templateIds: number[] = [],
  deckIds: number[] = [],
  statusBitFilter: number = 0
): Promise<CardData[] | null> {
  try {
    const cards = await invoke<CardData[]>("card_filter", {
      templateIds,
      deckIds,
      statusBitFilter,
    });
    return cards;
  } catch (error) {
    console.error("筛选卡片失败:", error);
    return null;
  }
}

/**
 * 更新卡片字段内容
 * @param cardId - 卡片ID，指定要更新的卡片
 * @param templateFields - 新的模板字段内容数组
 * @returns Promise<boolean> - 返回是否成功更新卡片内容，true表示成功，false表示失败
 * @description 调用后端cardedit.rs中的update_card_content命令更新指定卡片的字段内容
 */
export async function updateCardContent(
  cardId: number,
  templateFields: string[]
): Promise<boolean> {
  try {
    await invoke("update_card_content", {
      cardId,
      templateFields,
    });
    return true;
  } catch (error) {
    console.error("更新卡片内容失败:", error);
    return false;
  }
}

/**
 * 删除卡片
 * @param cardId - 卡片ID，指定要删除的卡片
 * @returns Promise<boolean> - 返回是否成功删除卡片，true表示成功，false表示失败
 * @description 调用后端cardedit.rs中的delete_card命令删除指定卡片及其相关复习记录
 */
export async function deleteCard(cardId: number): Promise<boolean> {
  try {
    await invoke("delete_card", {
      cardId,
    });
    return true;
  } catch (error) {
    console.error("删除卡片失败:", error);
    return false;
  }
}
