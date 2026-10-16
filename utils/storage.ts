import { GameState, Card, CardPossibilities, Color, CardNumber } from '@/types/game';

export const STORAGE_KEY = 'hanabi-game-state';

// JSON can't hold Sets, so card possibilities are stored as arrays
interface StoredCardPossibilities extends Omit<CardPossibilities, 'possibleColors' | 'possibleNumbers' | 'manualExclusions'> {
  possibleColors: Color[];
  possibleNumbers: CardNumber[];
  manualExclusions?: {
    colors: Color[];
    numbers: CardNumber[];
  };
}

type StoredCard = Card | StoredCardPossibilities;

interface StoredGameState extends Omit<GameState, 'players'> {
  players: (Omit<GameState['players'][number], 'hand'> & { hand: StoredCard[] })[];
}

/**
 * Convert Sets to Arrays for JSON serialization
 */
export function serializeGameState(state: GameState): StoredGameState {
  return {
    ...state,
    players: state.players.map(player => ({
      ...player,
      hand: (player.hand as (Card | CardPossibilities)[]).map((card): StoredCard => {
        if ('possibleColors' in card) {
          return {
            ...card,
            possibleColors: Array.from(card.possibleColors),
            possibleNumbers: Array.from(card.possibleNumbers),
            manualExclusions: card.manualExclusions ? {
              colors: Array.from(card.manualExclusions.colors),
              numbers: Array.from(card.manualExclusions.numbers),
            } : undefined,
          };
        }
        return card;
      }),
    })),
  };
}

/**
 * Reconstruct Sets from stored arrays
 */
export function reconstructGameState(stored: StoredGameState): GameState {
  return {
    ...stored,
    players: stored.players.map(player => ({
      ...player,
      hand: player.hand.map((card): Card | CardPossibilities => {
        if ('possibleColors' in card) {
          return {
            ...card,
            possibleColors: new Set(card.possibleColors),
            possibleNumbers: new Set(card.possibleNumbers),
            manualExclusions: card.manualExclusions ? {
              colors: new Set(card.manualExclusions.colors),
              numbers: new Set(card.manualExclusions.numbers),
            } : undefined,
          };
        }
        return card;
      }) as Card[] | CardPossibilities[],
    })),
  };
}

/**
 * Deep copy a game state so snapshots (e.g. undo history) can't be mutated
 */
export function cloneGameState(state: GameState): GameState {
  return reconstructGameState(serializeGameState(state));
}

/**
 * Load the saved game, or null if there isn't a valid one
 */
export function loadGameState(): GameState | null {
  const savedState = localStorage.getItem(STORAGE_KEY);
  if (!savedState) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedState);
    // Validate required fields exist
    if (!parsed.gameId || !parsed.players || !Array.isArray(parsed.players)) {
      throw new Error('Invalid game state structure');
    }
    return reconstructGameState(parsed);
  } catch (error) {
    console.error('Failed to load saved game:', error);
    // Clear corrupted data
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveGameState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeGameState(state)));
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
