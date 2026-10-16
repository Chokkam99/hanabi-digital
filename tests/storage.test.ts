import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import { Card, CardPossibilities } from '@/types/game';
import { playCard } from '@/utils/gameActions';
import { computePlayerKnowledge } from '@/utils/inference';
import { loadGameState, saveGameState, STORAGE_KEY } from '@/utils/storage';
import { sorted } from './helpers';

// Node has no localStorage, so stand in a Map-backed one for these tests
const store = new Map<string, string>();
const memoryStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => { store.set(key, value); },
  removeItem: (key: string) => { store.delete(key); },
};
const originalLocalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

// Shape written by the previous version: no Clue.handCardIds, no finalTurnsLeft
const oldSave = {
  gameId: 'game-1',
  myPlayerId: 'player-0',
  currentViewPlayerId: 'player-0',
  fireworks: { red: 1, yellow: 0, green: 0, blue: 0, white: 0 },
  discardPile: [],
  hintTokens: 7,
  strikeTokens: 0,
  deckCount: 34,
  isGameOver: false,
  score: 1,
  needsCardInput: false,
  settings: { showSafeToPlay: true, showSafeToDiscard: false, showDeductions: true, focusMode: false },
  players: [
    {
      id: 'player-0', name: 'Me', isMe: true, cluesReceived: [],
      hand: [{
        id: 'm0', position: 0, possibleColors: ['red', 'blue'], possibleNumbers: [1],
        manualExclusions: { colors: ['blue'], numbers: [] },
      }],
    },
    {
      id: 'player-1', name: 'Al', isMe: false,
      cluesReceived: [{ id: 'c', type: 'color', value: 'red', cardIds: ['a0'], timestamp: 1 }],
      hand: [{ id: 'a0', color: 'red', number: 2 }],
    },
  ],
};

describe('storage', () => {
  before(() => {
    Object.defineProperty(globalThis, 'localStorage', { configurable: true, writable: true, value: memoryStorage });
  });

  after(() => {
    if (originalLocalStorage) {
      Object.defineProperty(globalThis, 'localStorage', originalLocalStorage);
    } else {
      delete (globalThis as Partial<typeof globalThis>).localStorage;
    }
  });

  test('old saved games (no handCardIds / finalTurnsLeft) still load and play on', (t) => {
    store.set(STORAGE_KEY, JSON.stringify(oldSave));

    const game = loadGameState();
    assert.ok(game);
    const myCard = game.players[0].hand[0] as CardPossibilities;
    assert.ok(myCard.possibleColors instanceof Set);
    assert.ok(myCard.manualExclusions?.colors.has('blue'));

    const [alCard] = computePlayerKnowledge(game.players[1].hand as Card[], game.players[1].cluesReceived);
    assert.deepEqual(sorted(alCard.possibleColors), ['red']);

    // A play without finalTurnsLeft neither crashes nor ends the game
    const next = playCard(game, 'player-1', 0);
    assert.equal(next.fireworks.red, 2);
    assert.equal(next.isGameOver, false);
    assert.equal(next.finalTurnsLeft, undefined);

    saveGameState(next);
    const reloaded = loadGameState();
    assert.ok(reloaded);
    assert.deepEqual(sorted((reloaded.players[0].hand[0] as CardPossibilities).possibleColors), ['blue', 'red']);

    // Corrupt data is cleared rather than crashing the app
    store.set(STORAGE_KEY, '{nope');
    t.mock.method(console, 'error', () => {});
    assert.equal(loadGameState(), null);
    assert.equal(store.has(STORAGE_KEY), false);
  });
});
