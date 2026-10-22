import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { CardNumber, CardPossibilities, Card, Clue, Color, createInitialFireworks } from '@/types/game';
import {
  computeAutoExclusions,
  computePlayerKnowledge,
  getFinalPossibilities,
  getMyKnowledge,
  isSafeToDiscard,
  isTrash,
} from '@/utils/inference';
import { card, newGame, sorted } from './helpers';

function possibilities(colors: Color[], numbers: CardNumber[]): CardPossibilities {
  return { id: 'k', position: 0, possibleColors: new Set(colors), possibleNumbers: new Set(numbers) };
}

describe('computePlayerKnowledge', () => {
  test('a card drawn after a clue learns nothing from it', () => {
    // Alice held A, B, C when a red clue touched A. A was played and D drawn.
    const clue: Clue = { id: 'c1', type: 'color', value: 'red', cardIds: ['A'], handCardIds: ['A', 'B', 'C'], timestamp: 0 };
    const [d, b, c] = computePlayerKnowledge([card('D', 'red', 3), card('B', 'blue', 1), card('C', 'green', 2)], [clue]);

    assert.equal(d.possibleColors.size, 5, 'D is unconstrained');
    assert.ok(!b.possibleColors.has('red'), 'B keeps "not red"');
    assert.ok(!c.possibleColors.has('red'), 'C keeps "not red"');
  });

  test('legacy clues without handCardIds keep the old behavior', () => {
    const clue: Clue = { id: 'c1', type: 'color', value: 'red', cardIds: ['A'], timestamp: 0 };

    const [b] = computePlayerKnowledge([card('B', 'blue', 1)], [clue]);
    assert.equal(b.possibleColors.size, 5, 'skipped once A is gone');

    const [a, stillB] = computePlayerKnowledge([card('A', 'red', 1), card('B', 'blue', 1)], [clue]);
    assert.deepEqual(sorted(a.possibleColors), ['red']);
    assert.ok(!stillB.possibleColors.has('red'));
  });
});

describe('isTrash / isSafeToDiscard', () => {
  test('both red 2s discarded makes red 3-5 trash', () => {
    const fireworks = createInitialFireworks();
    fireworks.red = 1;
    const discards = [card('x', 'red', 2), card('y', 'red', 2)];

    assert.equal(isTrash('red', 3, fireworks, discards), true);
    assert.equal(isTrash('red', 2, fireworks, []), false);
    assert.equal(isTrash('red', 1, fireworks, []), true, 'already played');

    const redHigh = possibilities(['red'], [3, 4, 5]);
    assert.equal(isSafeToDiscard(redHigh, fireworks, discards), true);
    assert.equal(isSafeToDiscard(redHigh, fireworks, [discards[0]]), false);

    // Red 2 is impossible (both copies discarded) and red 1 is played, so either way it's trash
    const red1or2 = possibilities(['red'], [1, 2]);
    assert.equal(isSafeToDiscard(red1or2, fireworks, discards), true);
  });
});

describe('computeAutoExclusions', () => {
  test('counts cards on the fireworks', () => {
    const fireworks = createInitialFireworks();
    fireworks.blue = 5;
    const blueOrRed5 = possibilities(['blue', 'red'], [5]);

    const [auto] = computeAutoExclusions([blueOrRed5], [], fireworks);
    assert.deepEqual(sorted(auto.colors), ['blue'], 'blue 5 is on the table');
    assert.equal(auto.numbers.size, 0);

    const [none] = computeAutoExclusions([blueOrRed5], [], createInitialFireworks());
    assert.equal(none.colors.size, 0);
  });

  test("counts other players' hands and the discard pile", () => {
    // Clued 5: the red, green and blue 5s are all in sight
    const five = possibilities(['red', 'yellow', 'green', 'blue', 'white'], [5]);
    const visible = [card('a', 'red', 5), card('b', 'green', 5), card('c', 'blue', 5)];
    const [auto] = computeAutoExclusions([five], visible, createInitialFireworks());
    assert.deepEqual(sorted(auto.colors), ['blue', 'green', 'red']);

    // Clued red: two red 1s visible plus one on the fireworks, and the red 5 visible
    const fireworks = createInitialFireworks();
    fireworks.red = 1;
    const red = possibilities(['red'], [1, 2, 3, 4, 5]);
    const [redAuto] = computeAutoExclusions([red], [card('d', 'red', 1), card('e', 'red', 1), card('f', 'red', 5)], fireworks);
    assert.deepEqual(sorted(redAuto.numbers), [1, 5]);
  });

  test('counts my own cards that are already fully known', () => {
    const knownRed5 = possibilities(['red'], [5]);
    const clued5 = possibilities(['red', 'yellow', 'green', 'blue', 'white'], [5]);

    const [, auto] = computeAutoExclusions([knownRed5, clued5], [], createInitialFireworks());
    assert.deepEqual(sorted(auto.colors), ['red'], 'the only red 5 is my slot 1');
  });

  test('chains: a card that becomes known rules out options on the rest of my hand', () => {
    // Slot 1 is red 4 or red 5, and both red 4s are visible, so it must be red 5.
    // That makes red impossible for slot 2, which was clued 5 and is red or blue.
    const red4or5 = possibilities(['red'], [4, 5]);
    const redOrBlue5 = possibilities(['red', 'blue'], [5]);
    const visible = [card('a', 'red', 4), card('b', 'red', 4)];

    const [first, second] = computeAutoExclusions([red4or5, redOrBlue5], visible, createInitialFireworks());
    assert.deepEqual(sorted(first.numbers), [4]);
    assert.deepEqual(sorted(second.colors), ['red']);
    assert.deepEqual(sorted(getFinalPossibilities(redOrBlue5, second).colors), ['blue']);
  });

  test('rules nothing out when every option looks impossible (a mis-entered table)', () => {
    const clued5Red = possibilities(['red'], [5]);
    const [auto] = computeAutoExclusions([clued5Red], [card('a', 'red', 5)], createInitialFireworks());
    assert.equal(auto.colors.size + auto.numbers.size, 0);
  });

  test('marginals only: a color stays while any number with it is still possible', () => {
    // Red 5 is visible, but red 4 is still possible, so red can't be ruled out
    const redOrBlue4or5 = possibilities(['red', 'blue'], [4, 5]);
    const [auto] = computeAutoExclusions([redOrBlue4or5], [card('a', 'red', 5)], createInitialFireworks());
    assert.equal(auto.colors.size + auto.numbers.size, 0);
  });
});

describe('getMyKnowledge', () => {
  test('applies deductions live and follows corrections to the table', () => {
    const game = newGame(3);
    const me = game.players[0];
    const myHand = (me.hand as CardPossibilities[]).map((c, i) =>
      i === 0 ? { ...c, possibleNumbers: new Set<CardNumber>([5]) } : c
    );
    const withHands = (aliceSlot0: Card) => ({
      ...game,
      settings: { ...game.settings, showDeductions: true },
      players: game.players.map(p =>
        p.isMe ? { ...p, hand: myHand } : p.id === game.players[1].id ? { ...p, hand: [aliceSlot0, ...(p.hand as Card[]).slice(1)] } : p
      ),
    });

    const seen = getMyKnowledge(withHands(card('x', 'yellow', 5))).hand[0];
    assert.ok(!seen.possibleColors.has('yellow'), 'yellow 5 is in Alice\'s hand');

    // The entry is corrected to a yellow 4: nothing stale is left behind
    const corrected = getMyKnowledge(withHands(card('x', 'yellow', 4))).hand[0];
    assert.ok(corrected.possibleColors.has('yellow'));
  });

  test('with deductions off, shows clue knowledge only', () => {
    const game = newGame(3);
    const off = { ...game, settings: { ...game.settings, showDeductions: false } };
    const { hand } = getMyKnowledge(off);
    assert.equal(hand[0].possibleColors.size, 5);
    assert.equal(hand[0].possibleNumbers.size, 5);
  });
});

describe('getFinalPossibilities', () => {
  test('removes automatic exclusions on top of manual ones', () => {
    const anyCard: CardPossibilities = {
      ...possibilities(['red', 'yellow', 'blue'], [1, 2]),
      manualExclusions: { colors: new Set(['yellow']), numbers: new Set() },
    };
    const { colors } = getFinalPossibilities(anyCard, { colors: new Set(['red']), numbers: new Set() });
    assert.deepEqual(sorted(colors), ['blue']);
  });

  test('falls back to clues when manual exclusions contradict them', () => {
    const red1or2: CardPossibilities = {
      ...possibilities(['red'], [1, 2]),
      manualExclusions: { colors: new Set(['red']), numbers: new Set([2]) },
    };

    const { colors, numbers } = getFinalPossibilities(red1or2);
    assert.deepEqual(sorted(colors), ['red']);
    assert.deepEqual(sorted(numbers), [1]);
  });
});
