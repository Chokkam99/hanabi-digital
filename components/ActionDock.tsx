'use client';

import { useState } from 'react';
import { Player, Card, Color, CardNumber, ClueType, COLORS, NUMBERS, MAX_HINT_TOKENS } from '@/types/game';
import SuitEmblem, { SUIT_BG, SUIT_NAMES, SUIT_ON } from './SuitEmblem';
import Button from './ui/Button';
import Icon from './ui/Icon';

interface ActionDockProps {
  player: Player;
  selectedPositions: number[];
  hintTokens: number;
  focusMode: boolean;
  onClear: () => void;
  onSelectPositions: (positions: number[]) => void;
  onGiveClue: (type: ClueType, value: Color | CardNumber) => void;
  onPlay: () => void;
  onDiscard: () => void;
  onMove: (direction: 'left' | 'right') => void;
}

const selectedRing = 'ring-2 ring-ink ring-offset-2 ring-offset-lacquer-2';

function slotList(positions: number[], offset: number): string {
  const slots = [...positions].sort((a, b) => a - b).map(p => offset + p + 1);
  return `${slots.length === 1 ? 'slot' : 'slots'} ${slots.join(', ')}`;
}

/**
 * Actions for the selected cards, docked at the bottom of the screen
 */
export default function ActionDock({
  player,
  selectedPositions,
  hintTokens,
  focusMode,
  onClear,
  onSelectPositions,
  onGiveClue,
  onPlay,
  onDiscard,
  onMove,
}: ActionDockProps) {
  const [mode, setMode] = useState<'actions' | 'clue'>('actions');
  const [clue, setClue] = useState<{ type: ClueType; value: Color | CardNumber } | null>(null);

  const single = selectedPositions.length === 1;
  const position = selectedPositions[0];
  const hintsBlocked = hintTokens === 0 && !focusMode;
  const discardBlocked = hintTokens >= MAX_HINT_TOKENS && !focusMode;
  const who = player.isMe ? 'Your' : `${player.name}'s`;

  // Other players' cards are visible, so a clue's touched cards are known:
  // by the rules, a clue points out every matching card
  const matchesFor = (type: ClueType, value: Color | CardNumber) =>
    player.isMe
      ? null
      : (player.hand as Card[]).flatMap((card, index) =>
          (type === 'color' ? card.color === value : card.number === value) ? [index] : []
        );

  const pickClue = (type: ClueType, value: Color | CardNumber) => {
    setClue({ type, value });
    const matches = matchesFor(type, value);
    if (matches && matches.length > 0) onSelectPositions(matches);
  };

  const noMatches = clue !== null && matchesFor(clue.type, clue.value)?.length === 0;
  const canSubmitClue = clue !== null && !hintsBlocked && !noMatches;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 animate-dock-in">
      <div
        role="region"
        aria-label="Card actions"
        className="mx-auto max-w-xl rounded-t-2xl border border-b-0 border-rule bg-lacquer-2 px-4 pt-3 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-2">
          {mode === 'clue' && (
            <button
              onClick={() => setMode('actions')}
              aria-label="Back to actions"
              className="-ml-2 flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-lacquer-3 hover:text-ink"
            >
              <Icon name="arrow-left" size={18} />
            </button>
          )}
          <p className="text-sm">
            <span className="font-semibold">{mode === 'clue' ? (player.isMe ? 'Clue you received' : `Clue for ${player.name}`) : who}</span>{' '}
            <span className="text-ink-2">{slotList(selectedPositions, player.isMe ? 0 : player.cardsToEnter ?? 0)}</span>
          </p>
          <button
            onClick={onClear}
            aria-label="Clear selection"
            className="-mr-2 ml-auto flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-lacquer-3 hover:text-ink"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {mode === 'actions' ? (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <Button
                variant="primary"
                icon="clue"
                className="flex-[1.4]"
                disabled={hintsBlocked}
                onClick={() => setMode('clue')}
              >
                Clue
              </Button>
              {single && (
                <>
                  <Button icon="play" className="flex-1" onClick={onPlay}>
                    Play
                  </Button>
                  <Button icon="discard" className="flex-1" disabled={discardBlocked} onClick={onDiscard}>
                    Discard
                  </Button>
                </>
              )}
            </div>

            {single && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-2">
                  {hintsBlocked
                    ? 'No hint tokens left.'
                    : discardBlocked
                    ? `All ${MAX_HINT_TOKENS} hint tokens are in, so discarding isn't allowed.`
                    : 'Move card'}
                </span>
                <div className="flex gap-1">
                  <Button variant="ghost" aria-label="Move card left" className="min-h-9 px-3" disabled={position === 0} onClick={() => onMove('left')}>
                    <Icon name="arrow-left" size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    aria-label="Move card right"
                    className="min-h-9 px-3"
                    disabled={position === player.hand.length - 1}
                    onClick={() => onMove('right')}
                  >
                    <Icon name="arrow-right" size={18} />
                  </Button>
                </div>
              </div>
            )}
            {!single && hintsBlocked && <p className="text-xs text-ink-2">No hint tokens left.</p>}
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            <div
              role="group"
              aria-label="Clue color"
              className="grid gap-2"
              style={{ gridTemplateColumns: `repeat(${COLORS.length}, minmax(0, 1fr))` }}
            >
              {COLORS.map(color => {
                const selected = clue?.type === 'color' && clue.value === color;
                return (
                  <button
                    key={color}
                    onClick={() => pickClue('color', color)}
                    aria-label={SUIT_NAMES[color]}
                    aria-pressed={selected}
                    className={`flex h-12 items-center justify-center rounded-xl border-[1.5px] border-keyline transition-transform duration-150 active:scale-95 ${SUIT_BG[color]} ${SUIT_ON[color]} ${
                      selected ? `${selectedRing} scale-105` : ''
                    }`}
                  >
                    <SuitEmblem color={color} size={24} />
                  </button>
                );
              })}
            </div>
            <div role="group" aria-label="Clue number" className="grid grid-cols-5 gap-2">
              {NUMBERS.map(number => {
                const selected = clue?.type === 'number' && clue.value === number;
                return (
                  <button
                    key={number}
                    onClick={() => pickClue('number', number)}
                    aria-pressed={selected}
                    className={`flex h-12 items-center justify-center rounded-xl text-xl transition-transform duration-150 [font-stretch:80%] active:scale-95 ${
                      selected
                        ? `bg-lacquer-3 font-black text-ink ${selectedRing} scale-105`
                        : 'border border-rule bg-lacquer-3 font-extrabold text-ink'
                    }`}
                  >
                    {number}
                  </button>
                );
              })}
            </div>

            {noMatches && clue && (
              <p className="flex items-start gap-1.5 text-xs font-semibold text-ink">
                <Icon name="close" size={14} className="mt-px shrink-0 [stroke-width:2.5]" />
                None of {player.name}&apos;s cards are{' '}
                {clue.type === 'color' ? SUIT_NAMES[clue.value as Color].toLowerCase() : `${clue.value}s`}. Check the
                cards entered for them.
              </p>
            )}
            {player.isMe && <p className="text-xs text-ink-2">Select every card the clue pointed to, then pick what it said.</p>}

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              disabled={!canSubmitClue}
              onClick={() => clue && onGiveClue(clue.type, clue.value)}
            >
              {player.isMe ? 'Record clue' : 'Give clue'}
              <span className="font-medium opacity-60">
                · {Math.max(hintTokens - 1, 0)} {hintTokens - 1 === 1 ? 'hint' : 'hints'} left
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
