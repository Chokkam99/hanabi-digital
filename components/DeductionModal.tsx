'use client';

import { useState } from 'react';
import { GameState, CardPossibilities, Color, CardNumber, COLORS, NUMBERS } from '@/types/game';
import { computeAutoExclusions, getFinalPossibilities, getVisibleCards } from '@/utils/inference';
import { KnowledgeCard } from './Card';
import SuitEmblem, { SUIT_NAMES, SUIT_TEXT } from './SuitEmblem';
import Sheet from './ui/Sheet';
import Button from './ui/Button';

interface DeductionModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateGame: (newState: GameState) => void;
}

// Why an option is (or isn't) still possible
type OptionState = 'open' | 'clue' | 'seen' | 'manual';

const optionBase = 'relative flex size-10 items-center justify-center rounded-lg border transition-colors duration-150';

const optionStyles: Record<OptionState, string> = {
  open: 'border-rule bg-lacquer-2 hover:bg-lacquer-3',
  // Ruled out by clues or by count elimination: fixed, so not tappable
  clue: 'cursor-not-allowed border-transparent text-ink-3',
  seen: 'cursor-not-allowed border-dotted border-ink-3 text-ink-3',
  // Ruled out by hand: tap again to bring it back
  manual: 'border-dashed border-ink-3 text-ink-3 hover:bg-lacquer-2',
};

const optionNotes: Record<OptionState, string> = {
  open: '',
  clue: ', ruled out by clues',
  seen: ', ruled out: every copy is visible elsewhere',
  manual: ', ruled out by you',
};

// The diagonal strike used for ruled-out crests (matches the card backs)
function Strike() {
  return <span aria-hidden="true" className="absolute top-1/2 right-2 left-2 h-[1.5px] -rotate-45 bg-current" />;
}

export default function DeductionModal({ gameState, onClose, onUpdateGame }: DeductionModalProps) {
  const myPlayer = gameState.players.find(p => p.isMe);
  const myHand = (myPlayer?.hand ?? []) as CardPossibilities[];

  // Local state for editing
  const [editedHand, setEditedHand] = useState<CardPossibilities[]>(() =>
    myHand.map(card => ({
      ...card,
      manualExclusions: {
        colors: new Set(card.manualExclusions?.colors),
        numbers: new Set(card.manualExclusions?.numbers),
      },
    }))
  );

  // Validate player and hand structure (a CardPossibilities hand, not a Card[] hand)
  if (!myPlayer || myHand.length === 0 || !('possibleColors' in myHand[0])) {
    return null;
  }

  // Count elimination is live: it follows the table and the exclusions being edited here
  const auto = computeAutoExclusions(editedHand, getVisibleCards(gameState), gameState.fireworks);

  const stateOf = (card: CardPossibilities, index: number, type: 'color' | 'number', value: Color | CardNumber): OptionState => {
    if (type === 'color') {
      const color = value as Color;
      if (!card.possibleColors.has(color)) return 'clue';
      if (card.manualExclusions?.colors.has(color)) return 'manual';
      return auto[index].colors.has(color) ? 'seen' : 'open';
    }
    const number = value as CardNumber;
    if (!card.possibleNumbers.has(number)) return 'clue';
    if (card.manualExclusions?.numbers.has(number)) return 'manual';
    return auto[index].numbers.has(number) ? 'seen' : 'open';
  };

  // Toggle a manual exclusion for a specific card
  const toggleExclusion = (cardIndex: number, type: 'color' | 'number', value: Color | CardNumber) => {
    setEditedHand(prev => {
      const newHand = [...prev];
      const card = { ...newHand[cardIndex] };

      card.manualExclusions = {
        colors: new Set(card.manualExclusions?.colors),
        numbers: new Set(card.manualExclusions?.numbers),
      };

      // Count what's actually left, after clues, manual and automatic exclusions
      const remaining = getFinalPossibilities(card, auto[cardIndex]);

      if (type === 'color') {
        const colorValue = value as Color;
        if (card.manualExclusions.colors.has(colorValue)) {
          card.manualExclusions.colors.delete(colorValue);
        } else {
          // Don't allow ruling out the last option
          if (remaining.colors.size <= 1) return prev;
          card.manualExclusions.colors.add(colorValue);
        }
      } else {
        const numberValue = value as CardNumber;
        if (card.manualExclusions.numbers.has(numberValue)) {
          card.manualExclusions.numbers.delete(numberValue);
        } else {
          if (remaining.numbers.size <= 1) return prev;
          card.manualExclusions.numbers.add(numberValue);
        }
      }

      newHand[cardIndex] = card;
      return newHand;
    });
  };

  const handleClearAll = () => {
    setEditedHand(prev =>
      prev.map(card => ({ ...card, manualExclusions: { colors: new Set(), numbers: new Set() } }))
    );
  };

  const handleSave = () => {
    const hasManual = editedHand.some(
      card => (card.manualExclusions?.colors.size ?? 0) + (card.manualExclusions?.numbers.size ?? 0) > 0
    );
    onUpdateGame({
      ...gameState,
      players: gameState.players.map(p => (p.isMe ? { ...p, hand: editedHand } : p)),
      // Ruling something out only matters if deductions show on the cards
      settings: hasManual ? { ...gameState.settings, showDeductions: true } : gameState.settings,
    });
    onClose();
  };

  return (
    <Sheet
      title="Deductions"
      description="Options with every copy visible elsewhere are ruled out automatically (dotted). Tap an open option to rule it out yourself (dashed)."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" className="px-3" onClick={handleClearAll}>
            Clear mine
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      {!gameState.settings.showDeductions && (
        <p className="mb-3 rounded-lg border border-ink-3 bg-lacquer-2 px-3 py-2 text-[13px] text-ink-2">
          Deductions are off, so your cards show clues only. Saving anything you rule out here turns them on.
        </p>
      )}

      <ul className="divide-y divide-rule">
        {editedHand.map((card, index) => {
          const final = getFinalPossibilities(card, auto[index]);
          return (
            <li key={card.id} className="flex gap-4 py-4 first:pt-1">
              <div className="w-12 shrink-0">
                <KnowledgeCard possibleColors={final.colors} possibleNumbers={final.numbers} />
                <p className="mt-1.5 text-center text-xs font-semibold text-ink-2">{index + 1}</p>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div role="group" aria-label={`Slot ${index + 1} suits`} className="flex gap-1.5">
                  {COLORS.map(color => {
                    const state = stateOf(card, index, 'color', color);
                    return (
                      <button
                        key={color}
                        onClick={() => toggleExclusion(index, 'color', color)}
                        disabled={state === 'clue' || state === 'seen'}
                        aria-label={`${SUIT_NAMES[color]}${optionNotes[state]}`}
                        aria-pressed={state === 'manual'}
                        className={`${optionBase} ${optionStyles[state]} ${state === 'open' ? SUIT_TEXT[color] : ''}`}
                      >
                        <SuitEmblem color={color} size={20} />
                        {state !== 'open' && <Strike />}
                      </button>
                    );
                  })}
                </div>
                <div role="group" aria-label={`Slot ${index + 1} numbers`} className="flex gap-1.5">
                  {NUMBERS.map(num => {
                    const state = stateOf(card, index, 'number', num);
                    return (
                      <button
                        key={num}
                        onClick={() => toggleExclusion(index, 'number', num)}
                        disabled={state === 'clue' || state === 'seen'}
                        aria-label={`${num}${optionNotes[state]}`}
                        aria-pressed={state === 'manual'}
                        className={`${optionBase} text-lg font-extrabold [font-stretch:80%] ${optionStyles[state]} ${
                          state === 'open' ? 'text-ink' : 'line-through'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
