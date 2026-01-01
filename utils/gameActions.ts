import { GameState, Color, CardNumber, Clue, ClueType, CardPossibilities, Card, createInitialCardPossibilities } from '@/types/game';
import { applyClue } from '@/utils/inference';

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
    id: `clue-${Date.now()}`,
    type: clueType,
    value: clueValue,
    cardIds: cardIds,
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

  return {
    ...gameState,
    players: updatedPlayers,
    hintTokens: gameState.hintTokens - 1,
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
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  // Validate position is within bounds
  if (position < 0 || position >= player.hand.length) {
    throw new Error('Invalid card position');
  }

  // For other players, auto-detect the card from their visible hand
  let actualColor: Color;
  let actualNumber: CardNumber;
  let actualCardId: string;

  if (!player.isMe) {
    const card = (player.hand as Card[])[position];
    if (!card) {
      throw new Error('Invalid card position');
    }
    actualColor = card.color;
    actualNumber = card.number;
    actualCardId = card.id;
  } else {
    // For "me", require manual input (card is being revealed)
    if (!revealedColor || !revealedNumber) {
      throw new Error('Card color and number required for revealing');
    }
    actualColor = revealedColor;
    actualNumber = revealedNumber;
    const card = player.hand[position];
    // CardPossibilities always has an id field
    actualCardId = card.id;
  }

  const currentFireworkLevel = gameState.fireworks[actualColor];
  const isSuccess = currentFireworkLevel + 1 === actualNumber;

  // Remove card from hand
  let newHand: Card[] | CardPossibilities[];
  let pendingInput: { playerId: string; position: number } | undefined;

  if (player.isMe) {
    // For "me", add a new unknown card only if deck has cards
    newHand = [...(player.hand as CardPossibilities[])];
    newHand.splice(position, 1);

    if (gameState.deckCount > 0) {
      newHand.push(createInitialCardPossibilities(newHand.length));
    }

    // Reindex positions immutably
    newHand = newHand.map((card, idx) => ({
      ...card,
      position: idx,
    }));
  } else {
    // For other players, remove the card and mark for input (only if deck has cards)
    newHand = [...(player.hand as Card[])];
    newHand.splice(position, 1);
    if (gameState.deckCount > 0) {
      pendingInput = { playerId: player.id, position: newHand.length };
    }
  }

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, hand: newHand } : p
  );

  const newFireworks = isSuccess
    ? { ...gameState.fireworks, [actualColor]: currentFireworkLevel + 1 }
    : gameState.fireworks;

  const newStrikeTokens = isSuccess ? gameState.strikeTokens : Math.min(gameState.strikeTokens + 1, 3);
  const newScore = Object.values(newFireworks).reduce((sum, value) => sum + value, 0);
  const newDeckCount = gameState.deckCount > 0 ? gameState.deckCount - 1 : 0;

  return {
    ...gameState,
    players: updatedPlayers,
    fireworks: newFireworks,
    score: newScore,
    discardPile: isSuccess
      ? gameState.discardPile
      : [...gameState.discardPile, { id: actualCardId, color: actualColor, number: actualNumber }],
    strikeTokens: newStrikeTokens,
    isGameOver: newStrikeTokens === 3 && !gameState.settings.focusMode,
    hintTokens: isSuccess && actualNumber === 5 ? Math.min(gameState.hintTokens + 1, 8) : gameState.hintTokens,
    deckCount: newDeckCount,
    lastRoundStarted: newDeckCount === 0 || gameState.lastRoundStarted,
    pendingCardInput: pendingInput,
  };
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
  const player = gameState.players.find(p => p.id === playerId);
  if (!player) {
    throw new Error('Player not found');
  }

  // Validate position is within bounds
  if (position < 0 || position >= player.hand.length) {
    throw new Error('Invalid card position');
  }

  // For other players, auto-detect the card from their visible hand
  let actualColor: Color;
  let actualNumber: CardNumber;
  let actualCardId: string;

  if (!player.isMe) {
    const card = (player.hand as Card[])[position];
    if (!card) {
      throw new Error('Invalid card position');
    }
    actualColor = card.color;
    actualNumber = card.number;
    actualCardId = card.id;
  } else {
    // For "me", require manual input (card is being revealed)
    if (!revealedColor || !revealedNumber) {
      throw new Error('Card color and number required for revealing');
    }
    actualColor = revealedColor;
    actualNumber = revealedNumber;
    const card = player.hand[position];
    // CardPossibilities always has an id field
    actualCardId = card.id;
  }

  // Remove card from hand
  let newHand: Card[] | CardPossibilities[];
  let pendingInput: { playerId: string; position: number } | undefined;

  if (player.isMe) {
    // For "me", add a new unknown card only if deck has cards
    newHand = [...(player.hand as CardPossibilities[])];
    newHand.splice(position, 1);

    if (gameState.deckCount > 0) {
      newHand.push(createInitialCardPossibilities(newHand.length));
    }

    // Reindex positions immutably
    newHand = newHand.map((card, idx) => ({
      ...card,
      position: idx,
    }));
  } else {
    // For other players, remove the card and mark for input (only if deck has cards)
    newHand = [...(player.hand as Card[])];
    newHand.splice(position, 1);
    if (gameState.deckCount > 0) {
      pendingInput = { playerId: player.id, position: newHand.length };
    }
  }

  const updatedPlayers = gameState.players.map(p =>
    p.id === playerId ? { ...p, hand: newHand } : p
  );

  const newDeckCount = gameState.deckCount > 0 ? gameState.deckCount - 1 : 0;

  return {
    ...gameState,
    players: updatedPlayers,
    discardPile: [...gameState.discardPile, { id: actualCardId, color: actualColor, number: actualNumber }],
    hintTokens: Math.min(gameState.hintTokens + 1, 8),
    deckCount: newDeckCount,
    lastRoundStarted: newDeckCount === 0 || gameState.lastRoundStarted,
    pendingCardInput: pendingInput,
  };
}
