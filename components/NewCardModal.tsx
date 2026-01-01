'use client';

import { useState } from 'react';
import { GameState, Color, CardNumber, COLORS, NUMBERS, Card } from '@/types/game';

interface NewCardModalProps {
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

export default function NewCardModal({ gameState, onClose, onUpdateGame }: NewCardModalProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

  if (!gameState.pendingCardInput) return null;

  const player = gameState.players.find(p => p.id === gameState.pendingCardInput!.playerId);
  if (!player) return null;

  const handleSubmit = () => {
    if (!selectedColor || !selectedNumber) {
      alert('Please select both color and number');
      return;
    }

    const newCard: Card = {
      id: `card-${player.id}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      color: selectedColor,
      number: selectedNumber,
    };

    const updatedPlayers = gameState.players.map(p => {
      if (p.id === player.id) {
        return {
          ...p,
          hand: [newCard, ...(p.hand as Card[])],
        };
      }
      return p;
    });

    onUpdateGame({
      ...gameState,
      players: updatedPlayers,
      pendingCardInput: undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 rounded-t-3xl sm:rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">New Card for {player.name}</h2>
          <p className="text-white/70 text-sm mt-1">Enter the card they drew</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Color Selection */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Color</label>
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
            <label className="text-white font-semibold text-sm">Number</label>
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

          {/* Preview */}
          {selectedColor && selectedNumber && (
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <div className="text-4xl mb-1">{colorEmojis[selectedColor]}</div>
              <div className="text-2xl font-bold text-white">{selectedNumber}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSubmit}
            disabled={!selectedColor || !selectedNumber}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              selectedColor && selectedNumber
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg active:scale-95'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Add Card
          </button>
        </div>
      </div>
    </div>
  );
}
