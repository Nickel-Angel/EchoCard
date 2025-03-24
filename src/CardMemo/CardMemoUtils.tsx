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
