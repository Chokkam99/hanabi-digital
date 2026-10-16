// Inference engine for Hanabi card deduction

import { CardPossibilities, Clue, Color, CardNumber, Fireworks, Card, COLORS, NUMBERS, getCopiesPerCard } from '@/types/game';

/**
 * Apply a clue to a player's hand, updating all card possibilities
 */
export function applyClue(
  hand: CardPossibilities[],
  clue: Clue
): CardPossibilities[] {
  return hand.map((card) => {
    // Cards drawn after the clue was given learn nothing from it
    if (clue.handCardIds && !clue.handCardIds.includes(card.id)) {
      return card;
    }

    const wasSelected = clue.cardIds.includes(card.id);

    if (clue.type === 'color') {
      return applyColorClue(card, clue.value as Color, wasSelected);
    } else {
      return applyNumberClue(card, clue.value as CardNumber, wasSelected);
    }
  });
}

/**
 * Apply a color clue to a single card
 */
function applyColorClue(
  card: CardPossibilities,
  color: Color,
  wasSelected: boolean
): CardPossibilities {
  const newCard = { ...card };

  if (wasSelected) {
    // This card IS this color
    newCard.possibleColors = new Set([color]);
  } else {
    // This card is NOT this color
    const newColors = new Set(card.possibleColors);
    newColors.delete(color);
    newCard.possibleColors = newColors;
  }

  return newCard;
}

/**
 * Apply a number clue to a single card
 */
function applyNumberClue(
  card: CardPossibilities,
  number: CardNumber,
  wasSelected: boolean
): CardPossibilities {
  const newCard = { ...card };

  if (wasSelected) {
    // This card IS this number
    newCard.possibleNumbers = new Set([number]);
  } else {
    // This card is NOT this number
    const newNumbers = new Set(card.possibleNumbers);
    newNumbers.delete(number);
    newCard.possibleNumbers = newNumbers;
  }

  return newCard;
}

function countCards(cards: Card[], color: Color, number: CardNumber): number {
  return cards.filter(c => c.color === color && c.number === number).length;
}

/**
 * Check if a card is safe to play based on current fireworks state
 * A card is safe to play if ALL its possibilities would continue a firework
 */
export function isSafeToPlay(
  card: CardPossibilities,
  fireworks: Fireworks
): boolean {
  // Must have at least one possibility
  if (card.possibleColors.size === 0 || card.possibleNumbers.size === 0) {
    return false;
  }

  // Check all combinations
  for (const color of card.possibleColors) {
    for (const number of card.possibleNumbers) {
      // If ANY possibility is NOT the next card in its firework, it's not safe
      if (fireworks[color] + 1 !== number) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if a specific card can never be played: either it's already on its firework,
 * or every copy of a lower card in that color has been discarded
 */
export function isTrash(
  color: Color,
  number: CardNumber,
  fireworks: Fireworks,
  discardPile: Card[]
): boolean {
  if (number <= fireworks[color]) {
    return true;
  }

  for (let lower = fireworks[color] + 1; lower < number; lower++) {
    const lowerNumber = lower as CardNumber;
    if (countCards(discardPile, color, lowerNumber) >= getCopiesPerCard(lowerNumber)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a card is safe to discard
 * A card is safe to discard if ALL its possibilities are trash (already played or unreachable)
 */
export function isSafeToDiscard(
  card: CardPossibilities,
  fireworks: Fireworks,
  discardPile: Card[]
): boolean {
  // Must have at least one possibility
  if (card.possibleColors.size === 0 || card.possibleNumbers.size === 0) {
    return false;
  }

  for (const color of card.possibleColors) {
    for (const number of card.possibleNumbers) {
      // Every copy is already in the discard pile, so the card can't be this
      if (countCards(discardPile, color, number) >= getCopiesPerCard(number)) {
        continue;
      }

      if (!isTrash(color, number, fireworks, discardPile)) {
        return false; // This card might be needed
      }
    }
  }

  return true;
}

/**
 * Calculate how many possibilities remain for a card
 */
export function getPossibilityCount(card: CardPossibilities): number {
  return card.possibleColors.size * card.possibleNumbers.size;
}

/**
 * Compute what a player knows about their hand based on clues received
 * Starts with all possibilities for each card and applies clues by card ID
 */
export function computePlayerKnowledge(
  actualHand: Card[],
  cluesReceived: Clue[]
): CardPossibilities[] {
  // Start with all possibilities for each card, using the actual card IDs
  let hand: CardPossibilities[] = actualHand.map((card, position) => ({
    id: card.id,
    position,
    possibleColors: new Set(COLORS),
    possibleNumbers: new Set(NUMBERS),
  }));

  const currentCardIds = new Set(actualHand.map(card => card.id));

  for (const clue of cluesReceived) {
    // Clues saved before handCardIds existed don't record which cards were in hand,
    // so only apply them while one of the touched cards is still held
    if (!clue.handCardIds && !clue.cardIds.some(cardId => currentCardIds.has(cardId))) {
      continue;
    }

    hand = applyClue(hand, clue);
  }

  return hand;
}

/**
 * Get the final possibilities for a card after applying manual exclusions
 */
export function getFinalPossibilities(card: CardPossibilities): {
  colors: Set<Color>;
  numbers: Set<CardNumber>;
} {
  const colors = new Set(card.possibleColors);
  const numbers = new Set(card.possibleNumbers);

  // Apply manual exclusions if they exist
  if (card.manualExclusions) {
    card.manualExclusions.colors.forEach(color => colors.delete(color));
    card.manualExclusions.numbers.forEach(number => numbers.delete(number));
  }

  // A later clue can contradict an earlier manual exclusion; trust the clue
  return {
    colors: colors.size > 0 ? colors : new Set(card.possibleColors),
    numbers: numbers.size > 0 ? numbers : new Set(card.possibleNumbers),
  };
}

/**
 * Auto-deduce impossibilities based on visible cards (count elimination)
 * Visible cards are other players' hands and the discard pile; cards already
 * played on the fireworks are counted too
 * Returns updated hand with auto-detected exclusions added to manual exclusions
 */
export function applyAutoDeductions(
  myHand: CardPossibilities[],
  visibleCards: Card[],
  fireworks: Fireworks
): CardPossibilities[] {
  // Count visible cards by color and number
  const visibleCounts = new Map<string, number>();

  for (const visibleCard of visibleCards) {
    const key = `${visibleCard.color}-${visibleCard.number}`;
    visibleCounts.set(key, (visibleCounts.get(key) || 0) + 1);
  }

  // Each firework holds one copy of every number up to its current level
  for (const color of COLORS) {
    for (let number = 1; number <= fireworks[color]; number++) {
      const key = `${color}-${number}`;
      visibleCounts.set(key, (visibleCounts.get(key) || 0) + 1);
    }
  }

  return myHand.map(card => {
    const newCard = { ...card };

    // Create new sets to avoid mutation
    newCard.manualExclusions = {
      colors: new Set(card.manualExclusions?.colors),
      numbers: new Set(card.manualExclusions?.numbers),
    };

    // First, identify all impossible combinations
    const impossibleCombinations = new Set<string>();

    for (const color of card.possibleColors) {
      for (const number of card.possibleNumbers) {
        const key = `${color}-${number}`;

        // If all copies are visible, this combination is impossible
        if ((visibleCounts.get(key) || 0) >= getCopiesPerCard(number)) {
          impossibleCombinations.add(key);
        }
      }
    }

    // Only exclude a color if ALL numbers with that color are impossible
    for (const color of card.possibleColors) {
      const allNumbersImpossible = Array.from(card.possibleNumbers).every(number =>
        impossibleCombinations.has(`${color}-${number}`)
      );

      if (allNumbersImpossible && card.possibleColors.size > 1) {
        newCard.manualExclusions.colors.add(color);
      }
    }

    // Only exclude a number if ALL colors with that number are impossible
    for (const number of card.possibleNumbers) {
      const allColorsImpossible = Array.from(card.possibleColors).every(color =>
        impossibleCombinations.has(`${color}-${number}`)
      );

      if (allColorsImpossible && card.possibleNumbers.size > 1) {
        newCard.manualExclusions.numbers.add(number);
      }
    }

    return newCard;
  });
}
