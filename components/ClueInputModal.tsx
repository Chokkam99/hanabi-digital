'use client';

import { useState } from 'react';
import { Player, GameState, Clue, ClueType, Color, CardNumber, CardPossibilities, COLORS, NUMBERS } from '@/types/game';
import { applyClue } from '@/utils/inference';

interface ClueInputModalProps {
  player: Player;
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

export default function ClueInputModal({
  player,
  gameState,
  onClose,
  onUpdateGame,
}: ClueInputModalProps) {
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);
  const [clueType, setClueType] = useState<ClueType>('color');
  const [clueValue, setClueValue] = useState<Color | CardNumber | null>(null);

  const handleCardToggle = (position: number) => {
    setSelectedPositions((prev) =>
      prev.includes(position)
        ? prev.filter((p) => p !== position)
        : [...prev, position]
    );
  };

  const handleApplyClue = () => {
    if (!clueValue || selectedPositions.length === 0) {
      alert('Please select cards and a clue value');
      return;
    }

    // Get card IDs for the selected positions
    const cardIds = selectedPositions.map(pos => {
      const card = (player.hand as CardPossibilities[])[pos];
      return card.id;
    });

    // Create the clue object
    const newClue: Clue = {
      id: `clue-${Date.now()}`,
      type: clueType,
      value: clueValue,
      cardIds: cardIds,
      timestamp: Date.now(),
    };

    // Update the player's hand with the new clue
    const updatedPlayers = gameState.players.map((p) => {
      if (p.id === player.id) {
        const updatedHand = applyClue(
          p.hand as CardPossibilities[],
          newClue
        );

        return {
          ...p,
          hand: updatedHand,
          cluesReceived: [...p.cluesReceived, newClue],
        };
      }
      return p;
    });

    // Update game state (decrease hint tokens)
    const newGameState: GameState = {
      ...gameState,
      players: updatedPlayers,
      hintTokens: gameState.hintTokens - 1,
    };

    onUpdateGame(newGameState);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-gradient-to-b from-purple-900 to-indigo-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Add Clue</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Step 1: Select Cards */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">
              Step 1: Select cards that match this clue
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(player.hand as CardPossibilities[]).map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => handleCardToggle(index)}
                  className={`aspect-square rounded-lg font-bold text-lg transition-all ${
                    selectedPositions.includes(index)
                      ? 'bg-green-500 text-white shadow-lg scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <p className="text-white/60 text-xs">
              Selected: {selectedPositions.length > 0 ? selectedPositions.map(p => p + 1).join(', ') : 'None'}
            </p>
          </div>

          {/* Step 2: Select Clue Type */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">Step 2: Clue type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setClueType('color');
                  setClueValue(null);
                }}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  clueType === 'color'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🎨 Color
              </button>
              <button
                onClick={() => {
                  setClueType('number');
                  setClueValue(null);
                }}
                className={`py-3 rounded-xl font-semibold transition-all ${
                  clueType === 'number'
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                🔢 Number
              </button>
            </div>
          </div>

          {/* Step 3: Select Clue Value */}
          <div className="space-y-2">
            <label className="text-white font-semibold text-sm">
              Step 3: Select {clueType === 'color' ? 'color' : 'number'}
            </label>
            {clueType === 'color' ? (
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setClueValue(color)}
                    className={`aspect-square rounded-lg text-3xl transition-all ${
                      clueValue === color
                        ? 'bg-white shadow-lg scale-110'
                        : 'bg-white/20 hover:bg-white/30'
                    }`}
                  >
                    {colorEmojis[color]}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {NUMBERS.map((number) => (
                  <button
                    key={number}
                    onClick={() => setClueValue(number)}
                    className={`aspect-square rounded-lg font-bold text-xl transition-all ${
                      clueValue === number
                        ? 'bg-white text-purple-900 shadow-lg scale-110'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleApplyClue}
            disabled={!clueValue || selectedPositions.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              clueValue && selectedPositions.length > 0
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg active:scale-95'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Apply Clue
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
