// Action types for game moves

import { Color, CardNumber, Clue } from './game';

export type ActionType = 'give_clue' | 'play_card' | 'discard_card';

export interface BaseAction {
  id: string;
  type: ActionType;
  timestamp: number;
  actingPlayerId: string;
}

export interface GiveClueAction extends BaseAction {
  type: 'give_clue';
  receivingPlayerId: string;
  clue: Clue;
}

export interface PlayCardAction extends BaseAction {
  type: 'play_card';
  cardPosition: number;
  actualCard: {
    color: Color;
    number: CardNumber;
  };
  success: boolean; // Whether it successfully added to fireworks
}

export interface DiscardCardAction extends BaseAction {
  type: 'discard_card';
  cardPosition: number;
  actualCard: {
    color: Color;
    number: CardNumber;
  };
}

export type GameAction = GiveClueAction | PlayCardAction | DiscardCardAction;
