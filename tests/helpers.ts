import { Card, CardNumber, Color, COLORS, GameState } from '@/types/game';
import { getHandSize, initializeGame } from '@/utils/gameInit';

export function card(id: string, color: Color, number: CardNumber): Card {
  return { id, color, number };
}

/**
 * Sets have no order, so compare their contents as sorted arrays
 */
export function sorted<T>(values: Iterable<T>): T[] {
  return [...values].sort();
}

/**
 * A game with me in seat 0 and every other hand already entered, ready for the first turn.
 * Seat s, slot i holds COLORS[(s + i) % 5] with number (i % 4) + 1, so every hand has two 1s.
 */
export function newGame(playerCount: 2 | 3 | 4 | 5 = 3): GameState {
  const playerNames = ['Me', 'Alice', 'Bob', 'Cara', 'Dan'].slice(0, playerCount);
  const game = initializeGame({ playerCount, playerNames, myPlayerIndex: 0 });
  const handSize = getHandSize(playerCount);

  return {
    ...game,
    needsCardInput: false,
    players: game.players.map((player, seat) => player.isMe ? player : {
      ...player,
      hand: Array.from({ length: handSize }, (_, i) =>
        card(`p${seat}c${i}`, COLORS[(seat + i) % COLORS.length], ((i % 4) + 1) as CardNumber)
      ),
    }),
  };
}
