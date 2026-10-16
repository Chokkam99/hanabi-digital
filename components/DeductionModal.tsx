'use client';

import { useState } from 'react';
import { GameState, CardPossibilities, Color, CardNumber, COLORS, NUMBERS, Card } from '@/types/game';
import { applyAutoDeductions, getFinalPossibilities } from '@/utils/inference';
import { KnowledgeCard } from './Card';
import SuitEmblem, { SUIT_NAMES, SUIT_TEXT } from './SuitEmblem';
import Sheet from './ui/Sheet';
import Button from './ui/Button';

interface DeductionModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateGame: (newState: GameState) => void;
}

const optionBase = 'relative flex size-10 items-center justify-center rounded-lg border transition-colors duration-150';

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

  // Toggle exclusion for a specific card
  const toggleExclusion = (cardIndex: number, type: 'color' | 'number', value: Color | CardNumber) => {
    setEditedHand(prev => {
      const newHand = [...prev];
      const card = { ...newHand[cardIndex] };

      card.manualExclusions = {
        colors: new Set(card.manualExclusions?.colors),
        numbers: new Set(card.manualExclusions?.numbers),
      };

      // Exclusions left over from before a newer clue may not be in the clue
      // possibilities any more, so count what's actually left
      const remaining = getFinalPossibilities(card);

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

  // Rule out everything whose copies are all visible: other hands, discards, fireworks
  const handleAutoDeduce = () => {
    const visibleCards: Card[] = [
      ...gameState.discardPile,
      ...gameState.players.filter(p => !p.isMe).flatMap(p => p.hand as Card[]),
    ];
    setEditedHand(applyAutoDeductions(editedHand, visibleCards, gameState.fireworks));
  };

  const handleClearAll = () => {
    setEditedHand(prev =>
      prev.map(card => ({ ...card, manualExclusions: { colors: new Set(), numbers: new Set() } }))
    );
  };

  const handleSave = () => {
    const hasExclusions = editedHand.some(
      card => (card.manualExclusions?.colors.size ?? 0) + (card.manualExclusions?.numbers.size ?? 0) > 0
    );
    onUpdateGame({
      ...gameState,
      players: gameState.players.map(p => (p.isMe ? { ...p, hand: editedHand } : p)),
      // Deductions only matter if they show on the cards
      settings: hasExclusions ? { ...gameState.settings, showDeductions: true } : gameState.settings,
    });
    onClose();
  };

  return (
    <Sheet
      title="Deductions"
      description="Tap to rule out options clues haven't (dashed). Auto-deduce rules out cards whose every copy is visible elsewhere."
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" className="px-3" onClick={handleClearAll}>
            Clear all
          </Button>
          <Button className="flex-1" onClick={handleAutoDeduce}>
            Auto-deduce
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <ul className="divide-y divide-rule">
        {editedHand.map((card, index) => {
          const final = getFinalPossibilities(card);
          return (
            <li key={card.id} className="flex gap-4 py-4 first:pt-1">
              <div className="w-12 shrink-0">
                <KnowledgeCard possibleColors={final.colors} possibleNumbers={final.numbers} />
                <p className="mt-1.5 text-center text-xs font-semibold text-ink-2">{index + 1}</p>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div role="group" aria-label={`Slot ${index + 1} suits`} className="flex gap-1.5">
                  {COLORS.map(color => {
                    const fromClues = card.possibleColors.has(color);
                    const excluded = card.manualExclusions?.colors.has(color) ?? false;
                    return (
                      <button
                        key={color}
                        onClick={() => toggleExclusion(index, 'color', color)}
                        disabled={!fromClues}
                        aria-label={`${SUIT_NAMES[color]}${!fromClues ? ', ruled out by clues' : excluded ? ', ruled out' : ''}`}
                        aria-pressed={excluded}
                        className={`${optionBase} ${
                          !fromClues
                            ? 'cursor-not-allowed border-transparent text-ink-3'
                            : excluded
                            ? 'border-dashed border-ink-3 text-ink-3 hover:bg-lacquer-2'
                            : `border-rule bg-lacquer-2 hover:bg-lacquer-3 ${SUIT_TEXT[color]}`
                        }`}
                      >
                        <SuitEmblem color={color} size={20} />
                        {(!fromClues || excluded) && <Strike />}
                      </button>
                    );
                  })}
                </div>
                <div role="group" aria-label={`Slot ${index + 1} numbers`} className="flex gap-1.5">
                  {NUMBERS.map(num => {
                    const fromClues = card.possibleNumbers.has(num);
                    const excluded = card.manualExclusions?.numbers.has(num) ?? false;
                    return (
                      <button
                        key={num}
                        onClick={() => toggleExclusion(index, 'number', num)}
                        disabled={!fromClues}
                        aria-label={`${num}${!fromClues ? ', ruled out by clues' : excluded ? ', ruled out' : ''}`}
                        aria-pressed={excluded}
                        className={`${optionBase} text-lg font-extrabold [font-stretch:80%] ${
                          !fromClues
                            ? 'cursor-not-allowed border-transparent text-ink-3 line-through'
                            : excluded
                            ? 'border-dashed border-ink-3 text-ink-3 line-through hover:bg-lacquer-2'
                            : 'border-rule bg-lacquer-2 text-ink hover:bg-lacquer-3'
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
