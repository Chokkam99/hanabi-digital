// Inference engine for Hanabi card deduction

import { CardPossibilities, Clue, Color, CardNumber, Fireworks, Card, GameState, COLORS, NUMBERS, getCopiesPerCard } from '@/types/game';

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
 * Options ruled out for one card, by color and by number
 */
export interface Exclusions {
  colors: Set<Color>;
  numbers: Set<CardNumber>;
}

function without<T>(options: Set<T>, excluded: Iterable<T> | undefined): Set<T> {
  const remaining = new Set(options);
  for (const value of excluded ?? []) remaining.delete(value);
  return remaining;
}

/**
 * Get the final possibilities for a card: what its clues allow, minus the options
 * ruled out by hand, minus the ones ruled out automatically (every copy visible)
 */
export function getFinalPossibilities(card: CardPossibilities, autoExclusions?: Exclusions): {
  colors: Set<Color>;
  numbers: Set<CardNumber>;
} {
  // A later clue can contradict an earlier manual exclusion; trust the clue
  const manualColors = without(card.possibleColors, card.manualExclusions?.colors);
  const manualNumbers = without(card.possibleNumbers, card.manualExclusions?.numbers);
  const colors = manualColors.size > 0 ? manualColors : new Set(card.possibleColors);
  const numbers = manualNumbers.size > 0 ? manualNumbers : new Set(card.possibleNumbers);

  const autoColors = without(colors, autoExclusions?.colors);
  const autoNumbers = without(numbers, autoExclusions?.numbers);
  return {
    colors: autoColors.size > 0 ? autoColors : colors,
    numbers: autoNumbers.size > 0 ? autoNumbers : numbers,
  };
}

const comboKey = (color: Color, number: CardNumber) => `${color}-${number}`;

/**
 * Count elimination: rule out options whose every copy is visible somewhere else.
 * Visible copies are other players' hands, the discard pile, the cards on the fireworks,
 * and my own cards that are already fully known. Pure and recomputed from the table each
 * time, so it never goes stale when a hand is corrected or a card is drawn.
 */
export function computeAutoExclusions(
  myHand: CardPossibilities[],
  visibleCards: Card[],
  fireworks: Fireworks
): Exclusions[] {
  const tableCounts = new Map<string, number>();
  const addCopy = (counts: Map<string, number>, key: string) => counts.set(key, (counts.get(key) ?? 0) + 1);

  for (const visibleCard of visibleCards) {
    addCopy(tableCounts, comboKey(visibleCard.color, visibleCard.number));
  }
  // Each firework holds one copy of every number up to its current level
  for (const color of COLORS) {
    for (let number = 1; number <= fireworks[color]; number++) {
      addCopy(tableCounts, comboKey(color, number as CardNumber));
    }
  }

  const auto: Exclusions[] = myHand.map(() => ({ colors: new Set(), numbers: new Set() }));

  // A card that becomes fully known is one more visible copy for the rest of my hand,
  // which can pin down another card, so repeat until nothing changes
  for (let pass = 0; pass <= myHand.length; pass++) {
    const current = myHand.map((card, i) => getFinalPossibilities(card, auto[i]));
    const knownKeys = current.map(({ colors, numbers }) =>
      colors.size === 1 && numbers.size === 1 ? comboKey([...colors][0], [...numbers][0]) : null
    );
    let changed = false;

    current.forEach(({ colors, numbers }, i) => {
      const counts = new Map(tableCounts);
      knownKeys.forEach((key, j) => {
        if (key && j !== i) addCopy(counts, key);
      });
      const impossible = (color: Color, number: CardNumber) =>
        (counts.get(comboKey(color, number)) ?? 0) >= getCopiesPerCard(number);

      // A color is out only if it's impossible with every number still open (and vice versa)
      const deadColors = [...colors].filter(color => [...numbers].every(number => impossible(color, number)));
      const deadNumbers = [...numbers].filter(number => [...colors].every(color => impossible(color, number)));

      // If every option looks impossible, the table was entered inconsistently: rule nothing out
      if (deadColors.length < colors.size) {
        for (const color of deadColors) {
          if (!auto[i].colors.has(color)) {
            auto[i].colors.add(color);
            changed = true;
          }
        }
      }
      if (deadNumbers.length < numbers.size) {
        for (const number of deadNumbers) {
          if (!auto[i].numbers.has(number)) {
            auto[i].numbers.add(number);
            changed = true;
          }
        }
      }
    });

    if (!changed) break;
  }

  return auto;
}

/**
 * The cards I can see: every other player's hand and the discard pile
 */
export function getVisibleCards(gameState: GameState): Card[] {
  return [
    ...gameState.discardPile,
    ...gameState.players.filter(p => !p.isMe).flatMap(p => p.hand as Card[]),
  ];
}

/**
 * My hand as the app shows it. With deductions on, each card's options are narrowed by
 * what I've ruled out by hand and by count elimination; with them off, clues only.
 */
export function getMyKnowledge(gameState: GameState): { hand: CardPossibilities[]; auto: Exclusions[] } {
  const me = gameState.players.find(p => p.isMe);
  const hand = (me?.hand ?? []) as CardPossibilities[];
  const auto = computeAutoExclusions(hand, getVisibleCards(gameState), gameState.fireworks);

  if (!gameState.settings.showDeductions) {
    return { hand, auto };
  }

  return {
    hand: hand.map((card, i) => {
      const { colors, numbers } = getFinalPossibilities(card, auto[i]);
      return { ...card, possibleColors: colors, possibleNumbers: numbers };
    }),
    auto,
  };
}
