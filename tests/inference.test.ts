import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { CardNumber, CardPossibilities, Clue, Color, createInitialFireworks } from '@/types/game';
import { applyAutoDeductions, computePlayerKnowledge, getFinalPossibilities, isSafeToDiscard, isTrash } from '@/utils/inference';
import { card, sorted } from './helpers';

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

describe('applyAutoDeductions', () => {
  test('counts cards on the fireworks', () => {
    const fireworks = createInitialFireworks();
    fireworks.blue = 5;
    const blueOrRed5 = possibilities(['blue', 'red'], [5]);

    const [deduced] = applyAutoDeductions([blueOrRed5], [], fireworks);
    assert.deepEqual(sorted(deduced.manualExclusions?.colors ?? []), ['blue'], 'blue 5 is on the table');
    assert.equal(deduced.manualExclusions?.numbers.size, 0);

    const [noFireworks] = applyAutoDeductions([blueOrRed5], [], createInitialFireworks());
    assert.equal(noFireworks.manualExclusions?.colors.size, 0);
  });
});

describe('getFinalPossibilities', () => {
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
