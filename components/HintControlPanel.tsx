'use client';

import { useState } from 'react';
import { Color, CardNumber, COLORS, NUMBERS, ClueType } from '@/types/game';

interface HintControlPanelProps {
  selectedPositions: number[];
  playerName: string;
  hintTokens: number;
  onClearSelection: () => void;
  onSubmit: (type: ClueType, value: Color | CardNumber) => void;
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

export default function HintControlPanel({
  selectedPositions,
  playerName,
  hintTokens,
  onClearSelection,
  onSubmit,
}: HintControlPanelProps) {
  const [hintType, setHintType] = useState<ClueType>('color');
  const [hintValue, setHintValue] = useState<Color | CardNumber | null>(null);

  const handleSubmit = () => {
    if (hintValue === null) {
      alert('Please select a hint value');
      return;
    }

    if (hintTokens === 0) {
      alert('No hint tokens available!');
      return;
    }

    onSubmit(hintType, hintValue);
    // Reset selection
    setHintValue(null);
  };

  const canSubmit = hintValue !== null && hintTokens > 0;

  return (
    <div className="mt-3 bg-white/10 backdrop-blur-md rounded-lg p-3 space-y-3 transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">
            {playerName === 'Me' ? '📝 Record Clue Received' : `💡 Give Hint to ${playerName}`}
          </h3>
          <p className="text-white/60 text-xs">
            Cards {selectedPositions.map(p => p + 1).join(', ')}
          </p>
        </div>
        <button
          onClick={onClearSelection}
          className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold transition-all"
        >
          ×
        </button>
      </div>

      {/* Hint Type Toggle */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => {
            setHintType('color');
            setHintValue(null);
          }}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            hintType === 'color'
              ? 'bg-white text-purple-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🎨 Color
        </button>
        <button
          onClick={() => {
            setHintType('number');
            setHintValue(null);
          }}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            hintType === 'number'
              ? 'bg-white text-purple-900'
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          🔢 Number
        </button>
      </div>

      {/* Value Selection - Bigger buttons */}
      {hintType === 'color' ? (
        <div className="grid grid-cols-5 gap-2">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => setHintValue(color)}
              className={`h-12 rounded-lg text-2xl transition-all ${
                hintValue === color
                  ? 'bg-white shadow-lg scale-105 ring-2 ring-green-500'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              {colorEmojis[color]}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {NUMBERS.map(number => (
            <button
              key={number}
              onClick={() => setHintValue(number)}
              className={`h-12 rounded-lg font-bold text-xl transition-all ${
                hintValue === number
                  ? 'bg-white text-purple-900 shadow-lg scale-105 ring-2 ring-green-500'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {number}
            </button>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={`w-full py-3 rounded-lg text-sm font-semibold transition-all ${
          canSubmit
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg'
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
        }`}
      >
        {playerName === 'Me' ? '✓ Record Clue' : `💡 Give Hint (${hintTokens} available)`}
      </button>
    </div>
  );
}
