// Inference engine for Hanabi card deduction

import { CardPossibilities, Clue, Color, CardNumber, Fireworks, Card } from '@/types/game';

/**
 * Apply a clue to a player's hand, updating all card possibilities
 */
export function applyClue(
  hand: CardPossibilities[],
  clue: Clue
): CardPossibilities[] {
  return hand.map((card) => {
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
 * Check if a card is safe to discard
 * A card is safe to discard if ALL its possibilities are already played
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

  // Check all combinations
  for (const color of card.possibleColors) {
    for (const number of card.possibleNumbers) {
      // If this card could be needed, it's not safe to discard
      if (fireworks[color] < number) {
        // Check if we've already discarded all copies of this card
        // (This is a simplified check - could be enhanced later)
        const discardedCount = discardPile.filter(
          c => c.color === color && c.number === number
        ).length;

        // Card counts in Hanabi: three 1s, two 2-4s, one 5
        const totalCount = number === 1 ? 3 : number === 5 ? 1 : 2;

        if (discardedCount < totalCount) {
          return false; // This card might be needed
        }
      }
    }
  }

  return true;
}

/**
 * Get a human-readable summary of card possibilities
 */
export function getCardSummary(card: CardPossibilities): string {
  const colors = Array.from(card.possibleColors).join(', ');
  const numbers = Array.from(card.possibleNumbers).join(', ');

  if (card.possibleColors.size === 1 && card.possibleNumbers.size === 1) {
    return `${colors} ${numbers}`;
  }

  return `Colors: ${colors} | Numbers: ${numbers}`;
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
 * Only applies clues that reference cards still in the current hand
 */
export function computePlayerKnowledge(
  actualHand: Card[],
  cluesReceived: Clue[]
): CardPossibilities[] {
  // Start with all possibilities for each card, using the actual card IDs
  const hand: CardPossibilities[] = actualHand.map((card, position) => ({
    id: card.id,
    position,
    possibleColors: new Set(['red', 'yellow', 'green', 'blue', 'white'] as Color[]),
    possibleNumbers: new Set([1, 2, 3, 4, 5] as CardNumber[]),
  }));

  // Get all current card IDs
  const currentCardIds = new Set(actualHand.map(card => card.id));

  // Apply each clue in order, but only if it references cards still in hand
  for (const clue of cluesReceived) {
    // Check if any of the clue's card IDs are still in the current hand
    const hasRelevantCards = clue.cardIds.some(cardId => currentCardIds.has(cardId));

    if (hasRelevantCards) {
      const updatedHand = applyClue(hand, clue);
      // Update the hand with the new possibilities
      updatedHand.forEach((card, idx) => {
        hand[idx] = card;
      });
    }
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
  let colors = new Set(card.possibleColors);
  let numbers = new Set(card.possibleNumbers);

  // Apply manual exclusions if they exist
  if (card.manualExclusions) {
    card.manualExclusions.colors.forEach(color => colors.delete(color));
    card.manualExclusions.numbers.forEach(number => numbers.delete(number));
  }

  return { colors, numbers };
}

/**
 * Auto-deduce impossibilities based on visible cards (count elimination)
 * Returns updated hand with auto-detected exclusions added to manual exclusions
 */
export function applyAutoDeductions(
  myHand: CardPossibilities[],
  visibleCards: Card[]
): CardPossibilities[] {
  return myHand.map(card => {
    const newCard = { ...card };

    // Initialize manual exclusions if not present
    if (!newCard.manualExclusions) {
      newCard.manualExclusions = {
        colors: new Set(),
        numbers: new Set(),
      };
    } else {
      // Create new sets to avoid mutation
      newCard.manualExclusions = {
        colors: new Set(newCard.manualExclusions.colors),
        numbers: new Set(newCard.manualExclusions.numbers),
      };
    }

    // Count visible cards by color and number
    const visibleCounts = new Map<string, number>();

    for (const visibleCard of visibleCards) {
      const key = `${visibleCard.color}-${visibleCard.number}`;
      visibleCounts.set(key, (visibleCounts.get(key) || 0) + 1);
    }

    // First, identify all impossible combinations
    const impossibleCombinations = new Set<string>();

    for (const color of card.possibleColors) {
      for (const number of card.possibleNumbers) {
        const key = `${color}-${number}`;
        const visibleCount = visibleCounts.get(key) || 0;

        // Hanabi card counts: three 1s, two 2-4s, one 5
        const totalCopies = number === 1 ? 3 : number === 5 ? 1 : 2;

        // If all copies are visible, this combination is impossible
        if (visibleCount >= totalCopies) {
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
