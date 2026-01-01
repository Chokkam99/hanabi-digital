'use client';

import { useState } from 'react';
import { GameState, CardPossibilities, Color, CardNumber, COLORS, NUMBERS, Card } from '@/types/game';
import { applyAutoDeductions, getFinalPossibilities } from '@/utils/inference';

interface DeductionModalProps {
  gameState: GameState;
  onClose: () => void;
  onUpdateGame: (newState: GameState) => void;
}

export default function DeductionModal({
  gameState,
  onClose,
  onUpdateGame,
}: DeductionModalProps) {
  const myPlayer = gameState.players.find(p => p.isMe);

  // Validate player and hand structure
  if (!myPlayer || !myPlayer.hand || myPlayer.hand.length === 0) {
    return null;
  }

  // Check if this is a CardPossibilities hand (not a Card[] hand)
  if (!('possibleColors' in myPlayer.hand[0])) {
    return null;
  }

  const myHand = myPlayer.hand as CardPossibilities[];

  // Local state for editing
  const [editedHand, setEditedHand] = useState<CardPossibilities[]>(
    myHand.map(card => ({
      ...card,
      manualExclusions: card.manualExclusions
        ? {
            colors: new Set(card.manualExclusions.colors),
            numbers: new Set(card.manualExclusions.numbers),
          }
        : { colors: new Set(), numbers: new Set() },
    }))
  );

  // Toggle exclusion for a specific card
  const toggleExclusion = (cardIndex: number, type: 'color' | 'number', value: Color | CardNumber) => {
    setEditedHand(prev => {
      const newHand = [...prev];
      const card = { ...newHand[cardIndex] };

      if (!card.manualExclusions) {
        card.manualExclusions = { colors: new Set(), numbers: new Set() };
      } else {
        card.manualExclusions = {
          colors: new Set(card.manualExclusions.colors),
          numbers: new Set(card.manualExclusions.numbers),
        };
      }

      if (type === 'color') {
        const colorValue = value as Color;
        if (card.manualExclusions.colors.has(colorValue)) {
          // Removing exclusion is always safe
          card.manualExclusions.colors.delete(colorValue);
        } else {
          // Check if adding this exclusion would leave zero possibilities
          const remainingColors = card.possibleColors.size - card.manualExclusions.colors.size - 1;
          if (remainingColors <= 0) {
            // Don't allow this exclusion - would result in zero possibilities
            return prev;
          }
          card.manualExclusions.colors.add(colorValue);
        }
      } else {
        const numberValue = value as CardNumber;
        if (card.manualExclusions.numbers.has(numberValue)) {
          // Removing exclusion is always safe
          card.manualExclusions.numbers.delete(numberValue);
        } else {
          // Check if adding this exclusion would leave zero possibilities
          const remainingNumbers = card.possibleNumbers.size - card.manualExclusions.numbers.size - 1;
          if (remainingNumbers <= 0) {
            // Don't allow this exclusion - would result in zero possibilities
            return prev;
          }
          card.manualExclusions.numbers.add(numberValue);
        }
      }

      newHand[cardIndex] = card;
      return newHand;
    });
  };

  // Auto-deduce for all cards
  const handleAutoDeduce = () => {
    // Get all visible cards (other players + discard pile)
    const visibleCards: Card[] = [
      ...gameState.discardPile,
      ...gameState.players
        .filter(p => !p.isMe)
        .flatMap(p => p.hand as Card[]),
    ];

    const deducedHand = applyAutoDeductions(editedHand, visibleCards);
    setEditedHand(deducedHand);
  };

  // Clear all deductions
  const handleClearAll = () => {
    setEditedHand(prev =>
      prev.map(card => ({
        ...card,
        manualExclusions: { colors: new Set(), numbers: new Set() },
      }))
    );
  };

  // Save and close
  const handleSave = () => {
    const updatedPlayers = gameState.players.map(p =>
      p.isMe ? { ...p, hand: editedHand } : p
    );
    onUpdateGame({ ...gameState, players: updatedPlayers });
    onClose();
  };

  // Get color emoji
  const getColorEmoji = (color: Color) => {
    const emojis = { red: '🔴', yellow: '🟡', green: '🟢', blue: '🔵', white: '⚪' };
    return emojis[color];
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-black/30 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg">🧠 Manage Deductions</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Instructions */}
        <div className="px-4 py-2 bg-white/5 text-white/70 text-xs">
          Tap colors/numbers to mark as impossible based on visible cards
        </div>

        {/* Cards List */}
        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
          {editedHand.map((card, index) => {
            const finalPossibilities = getFinalPossibilities(card);
            const hasExclusions = card.manualExclusions &&
              (card.manualExclusions.colors.size > 0 || card.manualExclusions.numbers.size > 0);

            return (
              <div key={card.id} className="bg-white/10 rounded-xl p-3 space-y-2">
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">
                    Card {index + 1} {hasExclusions && '🧠'}
                  </h3>
                  <div className="text-white/60 text-xs">
                    {finalPossibilities.colors.size}×{finalPossibilities.numbers.size} = {finalPossibilities.colors.size * finalPossibilities.numbers.size} possibilities
                  </div>
                </div>

                {/* From Clues (Read-only) */}
                <div className="space-y-1">
                  <div className="text-white/50 text-xs font-semibold">From Clues:</div>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(card.possibleColors).map(color => (
                      <span key={color} className="text-lg">{getColorEmoji(color)}</span>
                    ))}
                    <span className="text-white/30 mx-1">|</span>
                    {Array.from(card.possibleNumbers).map(num => (
                      <span key={num} className="text-white text-sm px-1.5 py-0.5 bg-white/20 rounded">{num}</span>
                    ))}
                  </div>
                </div>

                {/* Manual Exclusions */}
                <div className="space-y-1">
                  <div className="text-white/50 text-xs font-semibold">Mark as Impossible:</div>

                  {/* Colors */}
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => {
                      const isFromClue = card.possibleColors.has(color);
                      const isExcluded = card.manualExclusions?.colors.has(color) || false;
                      const isDisabled = !isFromClue;

                      return (
                        <button
                          key={color}
                          onClick={() => !isDisabled && toggleExclusion(index, 'color', color)}
                          disabled={isDisabled}
                          className={`text-2xl transition-all ${
                            isDisabled
                              ? 'opacity-20 cursor-not-allowed'
                              : isExcluded
                              ? 'opacity-100 scale-110 ring-2 ring-red-500'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                        >
                          {getColorEmoji(color)}
                          {isExcluded && <span className="text-red-500 text-xs">✗</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Numbers */}
                  <div className="flex flex-wrap gap-2">
                    {NUMBERS.map(num => {
                      const isFromClue = card.possibleNumbers.has(num);
                      const isExcluded = card.manualExclusions?.numbers.has(num) || false;
                      const isDisabled = !isFromClue;

                      return (
                        <button
                          key={num}
                          onClick={() => !isDisabled && toggleExclusion(index, 'number', num)}
                          disabled={isDisabled}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            isDisabled
                              ? 'bg-white/10 text-white/20 cursor-not-allowed'
                              : isExcluded
                              ? 'bg-red-500 text-white ring-2 ring-red-400'
                              : 'bg-white/30 text-white hover:bg-white/40'
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Final Result */}
                {hasExclusions && (
                  <div className="pt-2 border-t border-white/10">
                    <div className="text-green-400 text-xs font-semibold mb-1">Final Possibilities:</div>
                    <div className="flex flex-wrap gap-1">
                      {Array.from(finalPossibilities.colors).map(color => (
                        <span key={color} className="text-lg">{getColorEmoji(color)}</span>
                      ))}
                      <span className="text-white/30 mx-1">|</span>
                      {Array.from(finalPossibilities.numbers).map(num => (
                        <span key={num} className="text-white text-sm px-1.5 py-0.5 bg-green-500/30 rounded">{num}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="bg-black/30 px-4 py-3 flex gap-2 sticky bottom-0">
          <button
            onClick={handleAutoDeduce}
            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
          >
            ✨ Auto-Deduce All
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
          >
            Clear All
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-all active:scale-95"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
