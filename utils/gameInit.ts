import { GameState, GameSetup, Player, CardPossibilities, Card, createInitialCardPossibilities, createInitialFireworks } from '@/types/game';

/**
 * Get hand size based on number of players
 * Hanabi rules: 2-3 players = 5 cards, 4-5 players = 4 cards
 */
export function getHandSize(playerCount: number): number {
  return playerCount <= 3 ? 5 : 4;
}

/**
 * Initialize a new game from setup configuration
 */
export function initializeGame(setup: GameSetup): GameState {
  const handSize = getHandSize(setup.playerCount);

  const players: Player[] = setup.playerNames.map((name, index) => {
    const isMe = index === setup.myPlayerIndex;
    const playerId = `player-${index}`;

    // If it's "me", create CardPossibilities array
    // If it's another player, create empty Card array (to be filled by user)
    const hand: CardPossibilities[] | Card[] = isMe
      ? Array.from({ length: handSize }, (_, i) => createInitialCardPossibilities(i))
      : [];

    return {
      id: playerId,
      name,
      isMe,
      hand,
      cluesReceived: [],
    };
  });

  const myPlayer = players[setup.myPlayerIndex];
  const totalDealtCards = setup.playerNames.length * handSize;

  return {
    gameId: `game-${Date.now()}`,
    players,
    myPlayerId: myPlayer.id,
    currentViewPlayerId: myPlayer.id, // Start by viewing my own hand
    fireworks: createInitialFireworks(),
    discardPile: [],
    hintTokens: 8,
    strikeTokens: 0,
    deckCount: 50 - totalDealtCards, // Subtract dealt cards from 50 total
    settings: {
      showSafeToPlay: false,
      showSafeToDiscard: false,
      showDeductions: false,
      focusMode: false,
    },
    isGameOver: false,
    score: 0,
    needsCardInput: true, // Flag to show card input screen
  };
}

/**
 * Calculate current game score from fireworks
 */
export function calculateScore(gameState: GameState): number {
  return Object.values(gameState.fireworks).reduce((sum, value) => sum + value, 0);
}

/**
 * Update game score
 */
export function updateGameScore(gameState: GameState): GameState {
  return {
    ...gameState,
    score: calculateScore(gameState),
  };
}
