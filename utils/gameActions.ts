import { GameState, Color, CardNumber, Clue, ClueType, CardPossibilities, Card, Player, createInitialCardPossibilities, MAX_HINT_TOKENS, MAX_STRIKES, MAX_SCORE } from '@/types/game';
import { applyClue } from '@/utils/inference';

/**
 * Count down the final round. After the last card is drawn, every player
 * (including the one who drew it) gets one more turn, then the game ends.
 */
function advanceFinalRound(gameState: GameState, drewLastCard: boolean): GameState {
  if (drewLastCard) {
    return {
      ...gameState,
      lastRoundStarted: true,
      finalTurnsLeft: gameState.players.length,
    };
  }

  if (!gameState.finalTurnsLeft) {
    return gameState;
  }

  const finalTurnsLeft = gameState.finalTurnsLeft - 1;
  return {
    ...gameState,
    finalTurnsLeft,
    isGameOver: gameState.isGameOver || (finalTurnsLeft === 0 && !gameState.settings.focusMode),
  };
}

/**
 * Apply a clue to a player's hand
 */
export function giveClue(
  gameState: GameState,
  receivingPlayerId: string,
  selectedPositions: number[],
  clueType: ClueType,
  clueValue: Color | CardNumber
): GameState {
  if (!receivingPlayerId || !clueValue || selectedPositions.length === 0) {
    throw new Error('Invalid clue parameters');
  }

  if (gameState.hintTokens === 0 && !gameState.settings.focusMode) {
    throw new Error('No hint tokens available');
  }

  const receivingPlayer = gameState.players.find(p => p.id === receivingPlayerId);
  if (!receivingPlayer) {
    throw new Error('Receiving player not found');
  }

  // Get card IDs for the selected positions
  const cardIds = selectedPositions.map(pos => {
    const card = receivingPlayer.hand[pos];
    if (!card) {
      throw new Error(`Invalid card position: ${pos}`);
    }
    return card.id;
  });

  const newClue: Clue = {
    id: `clue-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    type: clueType,
    value: clueValue,
    cardIds: cardIds,
    handCardIds: receivingPlayer.hand.map(card => card.id),
    timestamp: Date.now(),
  };

  const updatedPlayers = gameState.players.map(p => {
    if (p.id === receivingPlayerId) {
      // Only apply inference if this is "me" (can't see own cards)
      // For other players, just record the clue without modifying their visible hand
      if (p.isMe) {
        const updatedHand = applyClue(
          p.hand as CardPossibilities[],
          newClue
        );
        return {
          ...p,
          hand: updatedHand,
          cluesReceived: [...p.cluesReceived, newClue],
        };
      } else {
        return {
          ...p,
          cluesReceived: [...p.cluesReceived, newClue],
        };
      }
    }
    return p;
  });

  return advanceFinalRound({
    ...gameState,
    players: updatedPlayers,
    hintTokens: Math.max(gameState.hintTokens - 1, 0),
  }, false);
}

/**
 * Remove a card from a player's hand and draw a replacement if the deck has cards.
 * Newly drawn cards go to the left-most position.
 * For "me", the card being removed must be revealed (color/number provided).
 * For other players, the card is read from their visible hand.
 */
function removeAndDraw(
  gameState: GameState,
  playerId: string,
  position: number,
  revealedColor?: Color,
  revealedNumber?: CardNumber
): {
  removedCard: Card;
  players: Player[];
  deckCount: number;
  drewLastCard: boolean;
  pendingCardInput?: GameState['pendingCardInput'];
} {
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  // Validate position is within bounds
  if (position < 0 || position >= player.hand.length) {
    throw new Error('Invalid card position');
  }

  let removedCard: Card;
  if (player.isMe) {
    // For "me", require manual input (card is being revealed)
    if (!revealedColor || !revealedNumber) {
      throw new Error('Card color and number required for revealing');
    }
    removedCard = { id: player.hand[position].id, color: revealedColor, number: revealedNumber };
  } else {
    // For other players, auto-detect the card from their visible hand
    removedCard = { ...(player.hand as Card[])[position] };
  }

  const canDraw = gameState.deckCount > 0;
  let newHand: Card[] | CardPossibilities[];
  let pendingCardInput: GameState['pendingCardInput'];

  if (player.isMe) {
    const remaining = (player.hand as CardPossibilities[]).filter((_, idx) => idx !== position);
    const drawn = canDraw ? [createInitialCardPossibilities(0)] : [];

    // Reindex positions immutably
    newHand = [...drawn, ...remaining].map((card, idx) => ({
      ...card,
      position: idx,
    }));
  } else {
    // For other players, mark the drawn card for input (the user can see it)
    newHand = (player.hand as Card[]).filter((_, idx) => idx !== position);
    if (canDraw) {
      pendingCardInput = { playerId: player.id, position: 0 };
    }
  }

  return {
    removedCard,
    players: gameState.players.map(p =>
      p.id === playerId ? { ...p, hand: newHand } : p
    ),
    deckCount: canDraw ? gameState.deckCount - 1 : 0,
    drewLastCard: gameState.deckCount === 1,
    pendingCardInput,
  };
}

/**
 * Play a card from a player's hand
 */
export function playCard(
  gameState: GameState,
  playerId: string,
  position: number,
  revealedColor?: Color,
  revealedNumber?: CardNumber
): GameState {
  const { removedCard, players, deckCount, drewLastCard, pendingCardInput } =
    removeAndDraw(gameState, playerId, position, revealedColor, revealedNumber);

  const currentFireworkLevel = gameState.fireworks[removedCard.color];
  const isSuccess = currentFireworkLevel + 1 === removedCard.number;

  const newFireworks = isSuccess
    ? { ...gameState.fireworks, [removedCard.color]: currentFireworkLevel + 1 }
    : gameState.fireworks;

  const newStrikeTokens = isSuccess ? gameState.strikeTokens : Math.min(gameState.strikeTokens + 1, MAX_STRIKES);
  const newScore = Object.values(newFireworks).reduce((sum, value) => sum + value, 0);
  const isGameOver = !gameState.settings.focusMode && (newStrikeTokens === MAX_STRIKES || newScore === MAX_SCORE);

  return advanceFinalRound({
    ...gameState,
    players,
    fireworks: newFireworks,
    score: newScore,
    discardPile: isSuccess
      ? gameState.discardPile
      : [...gameState.discardPile, removedCard],
    strikeTokens: newStrikeTokens,
    isGameOver,
    // Completing a firework earns back a hint token
    hintTokens: isSuccess && removedCard.number === 5 ? Math.min(gameState.hintTokens + 1, MAX_HINT_TOKENS) : gameState.hintTokens,
    deckCount,
    pendingCardInput,
  }, drewLastCard);
}

/**
 * Discard a card from a player's hand
 */
export function discardCard(
  gameState: GameState,
  playerId: string,
  position: number,
  revealedColor?: Color,
  revealedNumber?: CardNumber
): GameState {
  const { removedCard, players, deckCount, drewLastCard, pendingCardInput } =
    removeAndDraw(gameState, playerId, position, revealedColor, revealedNumber);

  return advanceFinalRound({
    ...gameState,
    players,
    discardPile: [...gameState.discardPile, removedCard],
    hintTokens: Math.min(gameState.hintTokens + 1, MAX_HINT_TOKENS),
    deckCount,
    pendingCardInput,
  }, drewLastCard);
}
