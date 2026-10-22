import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { Card, CardPossibilities, DECK_SIZE } from '@/types/game';
import { discardCard, giveClue, playCard } from '@/utils/gameActions';
import { computePlayerKnowledge } from '@/utils/inference';
import { card, newGame, sorted } from './helpers';

describe('giveClue', () => {
  test('records the hand snapshot; editing a card (same id, new color) keeps its knowledge', () => {
    let game = newGame(3);
    const alice = game.players[1];
    const aliceHand = alice.hand as Card[];

    game = giveClue(game, alice.id, [0, 4], 'number', 1);
    const [clue] = game.players[1].cluesReceived;
    assert.deepEqual(clue.handCardIds, aliceHand.map(c => c.id));
    assert.equal(game.hintTokens, 7);

    // What EditCardsModal does when a card was entered wrong: keep the id, change the face
    const edited = (game.players[1].hand as Card[]).map((c, i): Card => i === 0 ? { ...c, color: 'white' } : c);
    const knowledge = computePlayerKnowledge(edited, game.players[1].cluesReceived);
    assert.deepEqual(sorted(knowledge[0].possibleNumbers), [1]);
  });

  test('a clue to me narrows my hand', () => {
    let game = newGame(3);
    game = giveClue(game, game.myPlayerId, [1, 3], 'color', 'blue');
    const myHand = game.players[0].hand as CardPossibilities[];

    assert.deepEqual(sorted(myHand[1].possibleColors), ['blue']);
    assert.deepEqual(sorted(myHand[3].possibleColors), ['blue']);
    assert.ok(!myHand[0].possibleColors.has('blue'));
  });

  test('hint tokens never go negative in focus mode; giving a clue at 0 throws otherwise', () => {
    let game = { ...newGame(3), hintTokens: 0 };
    assert.throws(() => giveClue(game, game.players[1].id, [0], 'number', 1), /No hint tokens/);

    game = { ...game, settings: { ...game.settings, focusMode: true } };
    game = giveClue(game, game.players[1].id, [0], 'number', 1);
    assert.equal(game.hintTokens, 0);
  });
});

describe('playCard / discardCard', () => {
  test('my drawn card goes to the left (slot 1) and positions are reindexed', () => {
    const game = { ...newGame(3), hintTokens: 5 };
    const ids = game.players[0].hand.map(c => c.id);

    const next = discardCard(game, game.myPlayerId, 2, 'red', 3);
    const myHand = next.players[0].hand as CardPossibilities[];

    assert.equal(myHand.length, 5);
    assert.ok(!ids.includes(myHand[0].id), 'new card in slot 1');
    assert.deepEqual(myHand.slice(1).map(c => c.id), [ids[0], ids[1], ids[3], ids[4]]);
    assert.deepEqual(myHand.map(c => c.position), [0, 1, 2, 3, 4]);
    assert.equal(next.hintTokens, 6);
    assert.deepEqual(next.discardPile.at(-1), { id: ids[2], color: 'red', number: 3 });
  });

  test("another player's play reads the card from their hand and asks for the draw at slot 1", () => {
    const game = newGame(3);
    const alice = game.players[1];
    const aliceHand = alice.hand as Card[];
    const slot = aliceHand.findIndex(c => c.number === 1);
    const played = aliceHand[slot];

    const next = playCard(game, alice.id, slot);

    assert.equal(next.fireworks[played.color], 1);
    assert.deepEqual(next.pendingCardInput, { playerId: alice.id, position: 0 });
    assert.equal(next.players[1].hand.length, 4);
    assert.equal(next.deckCount, DECK_SIZE - 15 - 1);
  });

  test('a misplay strikes; the third strike ends the game', () => {
    const game = { ...newGame(3), strikeTokens: 2 };

    const next = playCard(game, game.myPlayerId, 0, 'red', 4);

    assert.equal(next.strikeTokens, 3);
    assert.equal(next.isGameOver, true);
    assert.equal(next.discardPile.length, 1);
    assert.equal(next.players[0].hand.length, 4, 'the game is over, so nothing is drawn');
    assert.equal(next.deckCount, game.deckCount);
  });

  test('a perfect score (25) ends the game; playing a 5 returns a hint token', () => {
    const game = {
      ...newGame(3),
      fireworks: { red: 5, yellow: 5, green: 5, blue: 5, white: 4 },
      hintTokens: 3,
    };

    const next = playCard(game, game.myPlayerId, 0, 'white', 5);

    assert.equal(next.score, 25);
    assert.equal(next.isGameOver, true);
    assert.equal(next.hintTokens, 4);
    assert.equal(next.players[0].hand.length, 4, 'the game is over, so nothing is drawn');
    assert.equal(next.deckCount, game.deckCount);
  });

  test("another player's game-ending play asks for no draw", () => {
    const start = newGame(3);
    const alice = start.players[1];

    // Third strike: Alice's slot 2 holds a green 2, which can't go on an empty firework
    const struckOut = playCard({ ...start, strikeTokens: 2 }, alice.id, 1);
    assert.equal(struckOut.isGameOver, true);
    assert.equal(struckOut.pendingCardInput, undefined);
    assert.equal(struckOut.players[1].hand.length, 4);
    assert.equal(struckOut.deckCount, start.deckCount);

    // Perfect score: Alice completes the last firework
    const aliceHand = [card('p1c0', 'white', 5), ...(alice.hand as Card[]).slice(1)];
    const lastFive = {
      ...start,
      fireworks: { red: 5, yellow: 5, green: 5, blue: 5, white: 4 },
      players: start.players.map(p => (p.id === alice.id ? { ...p, hand: aliceHand } : p)),
    };
    const perfect = playCard(lastFive, alice.id, 0);
    assert.equal(perfect.score, 25);
    assert.equal(perfect.isGameOver, true);
    assert.equal(perfect.pendingCardInput, undefined);
    assert.equal(perfect.deckCount, start.deckCount);
  });

  test('in focus mode the game never ends; the draw waits at the left instead of prompting', () => {
    const start = newGame(3);
    const game = { ...start, strikeTokens: 2, settings: { ...start.settings, focusMode: true } };

    const next = playCard(game, game.players[1].id, 1);

    assert.equal(next.isGameOver, false);
    assert.equal(next.pendingCardInput, undefined, 'Focus mode skips card entry');
    assert.equal(next.players[1].cardsToEnter, 1);
    assert.equal(next.deckCount, game.deckCount - 1);
  });

  test("another player's draw is counted until it's entered; an empty deck counts a missed draw", () => {
    const start = newGame(3);
    const alice = start.players[1];

    const drew = discardCard({ ...start, hintTokens: 4 }, alice.id, 0);
    assert.equal(drew.players[1].cardsToEnter, 1);
    assert.equal(drew.players[1].missedDraws, undefined);

    const deckOut = discardCard({ ...start, hintTokens: 4, deckCount: 0 }, alice.id, 0);
    assert.equal(deckOut.pendingCardInput, undefined);
    assert.equal(deckOut.players[1].cardsToEnter, undefined);
    assert.equal(deckOut.players[1].missedDraws, 1, 'the hand is legitimately one card short');
  });

  test('after leaving Focus mode at 3 strikes, only a misplay ends the game', () => {
    const start = newGame(3);
    const atThree = { ...start, strikeTokens: 3 };
    const alice = atThree.players[1];

    // Alice's slot 1 is a yellow 1, which fits the empty yellow firework
    const fits = playCard(atThree, alice.id, 0);
    assert.equal(fits.fireworks.yellow, 1);
    assert.equal(fits.isGameOver, false);

    // Her slot 2 is a green 2, which doesn't fit
    const misplay = playCard(atThree, alice.id, 1);
    assert.equal(misplay.isGameOver, true);
  });
});

describe('final round', () => {
  test('every player gets one more turn after the last card is drawn, then the game ends', () => {
    let game = { ...newGame(3), deckCount: 1, hintTokens: 4 };

    game = discardCard(game, game.myPlayerId, 0, 'red', 3); // draws the last card
    assert.equal(game.deckCount, 0);
    assert.equal(game.lastRoundStarted, true);
    assert.equal(game.finalTurnsLeft, 3);
    assert.equal(game.players[0].hand.length, 5, 'the last card was drawn');

    game = giveClue(game, game.players[1].id, [0], 'number', 1);
    assert.equal(game.finalTurnsLeft, 2);

    game = discardCard(game, game.players[2].id, 0);
    assert.equal(game.finalTurnsLeft, 1);
    assert.equal(game.pendingCardInput, undefined, 'nothing left to draw');
    assert.equal(game.players[2].hand.length, 4);
    assert.equal(game.isGameOver, false);

    game = discardCard(game, game.myPlayerId, 0, 'blue', 2);
    assert.equal(game.finalTurnsLeft, 0);
    assert.equal(game.isGameOver, true);
    assert.equal(game.players[0].hand.length, 4);
  });

  test('the countdown is not enforced in focus mode', () => {
    const start = newGame(2);
    let game = { ...start, deckCount: 1, hintTokens: 4, settings: { ...start.settings, focusMode: true } };

    game = discardCard(game, game.myPlayerId, 0, 'red', 3);
    game = discardCard(game, game.myPlayerId, 0, 'red', 3);
    game = discardCard(game, game.myPlayerId, 0, 'red', 3);

    assert.equal(game.finalTurnsLeft, 0);
    assert.equal(game.isGameOver, false);
  });
});
