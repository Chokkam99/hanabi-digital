// Core game types for Hanabi Digital

export type Color = 'red' | 'yellow' | 'green' | 'blue' | 'white';
export type CardNumber = 1 | 2 | 3 | 4 | 5;

export const COLORS: Color[] = ['red', 'yellow', 'green', 'blue', 'white'];
export const NUMBERS: CardNumber[] = [1, 2, 3, 4, 5];

export const MAX_HINT_TOKENS = 8;
export const MAX_STRIKES = 3;
export const MAX_SCORE = 25;
export const DECK_SIZE = 50;

/**
 * Copies of each card in the deck: three 1s, two each of 2-4, one 5
 */
export function getCopiesPerCard(number: CardNumber): number {
  return number === 1 ? 3 : number === 5 ? 1 : 2;
}

// Actual card (what other players see)
export interface Card {
  color: Color;
  number: CardNumber;
  id: string; // Unique identifier for each card
}

// Card possibilities (what a player knows about their own card)
export interface CardPossibilities {
  id: string;
  position: number; // 0-3 for 4-card hands
  possibleColors: Set<Color>;
  possibleNumbers: Set<CardNumber>;
  // Manual deductions - colors/numbers the player has marked as impossible
  manualExclusions?: {
    colors: Set<Color>;
    numbers: Set<CardNumber>;
  };
}

// Clue types
export type ClueType = 'color' | 'number';

export interface Clue {
  id: string;
  type: ClueType;
  value: Color | CardNumber;
  cardIds: string[]; // Which cards this clue applies to (by ID, not position)
  // Every card in the hand when the clue was given. Cards drawn later learn nothing from it.
  // Optional because games saved before this field existed don't have it.
  handCardIds?: string[];
  timestamp: number;
}

// Player types
export interface Player {
  id: string;
  name: string;
  isMe: boolean;
  hand: Card[] | CardPossibilities[]; // Card[] for others, CardPossibilities[] for me
  cluesReceived: Clue[];
}

// Fireworks state (each color stack)
export type Fireworks = {
  [K in Color]: number; // 0-5 (0 means no cards played yet)
};

// Game settings
export interface GameSettings {
  showSafeToPlay: boolean;
  showSafeToDiscard: boolean;
  showDeductions: boolean; // Whether to show manual/auto deductions in card display
  focusMode: boolean; // Skip mandatory card input - makes tracking optional
}

// Main game state
export interface GameState {
  gameId: string;
  players: Player[];
  myPlayerId: string;
  currentViewPlayerId: string; // Which player's perspective we're viewing
  fireworks: Fireworks;
  discardPile: Card[];
  hintTokens: number; // 0-8
  strikeTokens: number; // 0-3
  deckCount: number; // Remaining cards in deck
  settings: GameSettings;
  isGameOver: boolean;
  score: number; // Sum of all fireworks
  lastRoundStarted?: boolean; // Flag when deck depletes (last round has begun)
  finalTurnsLeft?: number; // Turns remaining after the last card is drawn
  needsCardInput?: boolean; // Whether we need to input other players' cards at start
  pendingCardInput?: { // When a player draws a new card
    playerId: string;
    position: number;
  };
}

// Game setup
export interface GameSetup {
  playerCount: 2 | 3 | 4 | 5;
  playerNames: string[];
  myPlayerIndex: number; // Which player is "me"
}

// Helper functions for card possibilities
export function createInitialCardPossibilities(position: number): CardPossibilities {
  return {
    id: `card-${position}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    position,
    possibleColors: new Set(COLORS),
    possibleNumbers: new Set(NUMBERS),
  };
}

export function createInitialFireworks(): Fireworks {
  return {
    red: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    white: 0,
  };
}
