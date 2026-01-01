'use client';

import { useState } from 'react';
import { GameState, Color, CardNumber, COLORS, NUMBERS, CardPossibilities, Card } from '@/types/game';
import { playCard, discardCard } from '@/utils/gameActions';

interface RevealCardModalProps {
  playerId: string;
  position: number;
  actionType: 'play' | 'discard';
  gameState: GameState;
  onClose: () => void;
  onUpdateGame: (newState: GameState) => void;
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

export default function RevealCardModal({
  playerId,
  position,
  actionType,
  gameState,
  onClose,
  onUpdateGame,
}: RevealCardModalProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

  const player = gameState.players.find(p => p.id === playerId);

  if (!player) {
    return null;
  }

  const handleSubmit = () => {
    try {
      // If player has CardPossibilities (isMe), require color/number input
      // If player has Card[] (other players), auto-detect from visible cards
      if (player.isMe) {
        if (!selectedColor || !selectedNumber) {
          alert('Please select both color and number');
          return;
        }
      }

      const newState = actionType === 'play'
        ? playCard(gameState, playerId, position, selectedColor || undefined, selectedNumber || undefined)
        : discardCard(gameState, playerId, position, selectedColor || undefined, selectedNumber || undefined);

      onUpdateGame(newState);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const canSubmit = () => {
    if (player.isMe) {
      return selectedColor !== null && selectedNumber !== null;
    }
    // For other players, card is auto-detected so always ready
    return true;
  };

  // For other players, show the card that will be played/discarded
  const visibleCard = !player.isMe ? (player.hand as Card[])[position] : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">
            {actionType === 'play' ? '▶' : '🗑'} {actionType === 'play' ? 'Playing' : 'Discarding'} Card {position + 1}
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {player.isMe ? (
            <>
              <div className="bg-blue-500/20 rounded-xl p-3">
                <p className="text-white text-sm text-center">
                  What card was revealed when you {actionType === 'play' ? 'played' : 'discarded'} it?
                </p>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-white font-semibold text-sm">Card Color</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-lg text-3xl transition-all ${
                        selectedColor === color
                          ? 'bg-white shadow-lg scale-110'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {colorEmojis[color]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Selection */}
              <div className="space-y-2">
                <label className="text-white font-semibold text-sm">Card Number</label>
                <div className="grid grid-cols-5 gap-2">
                  {NUMBERS.map(number => (
                    <button
                      key={number}
                      onClick={() => setSelectedNumber(number)}
                      className={`aspect-square rounded-lg font-bold text-xl transition-all ${
                        selectedNumber === number
                          ? 'bg-white text-purple-900 shadow-lg scale-110'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {visibleCard && (
                <div className="bg-green-500/20 rounded-xl p-4 text-center">
                  <p className="text-white/70 text-sm mb-2">
                    Card being {actionType === 'play' ? 'played' : 'discarded'}:
                  </p>
                  <div className="text-5xl mb-2">{colorEmojis[visibleCard.color]}</div>
                  <div className="text-3xl font-bold text-white">{visibleCard.number}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
              canSubmit()
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {actionType === 'play' ? 'Play Card' : 'Discard Card'}
          </button>
        </div>
      </div>
    </div>
  );
}
