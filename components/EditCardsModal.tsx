'use client';

import { useState } from 'react';
import { GameState, Card, Color, CardNumber, COLORS, NUMBERS } from '@/types/game';
import SmallCardPreview from './SmallCardPreview';

interface EditCardsModalProps {
  gameState: GameState;
  playerId: string;
  onClose: () => void;
  onUpdateGame: (newState: GameState, saveToHistory?: boolean) => void;
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

export default function EditCardsModal({ gameState, playerId, onClose, onUpdateGame }: EditCardsModalProps) {
  const player = gameState.players.find(p => p.id === playerId);

  if (!player || player.isMe) {
    return null;
  }

  const totalCards = gameState.players.length <= 3 ? 5 : 4;
  const [playerCards, setPlayerCards] = useState<Card[]>(player.hand as Card[]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

  const handleAddOrUpdateCard = () => {
    if (!selectedColor || !selectedNumber) return;

    const newCard: Card = {
      id: `card-${playerId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      color: selectedColor,
      number: selectedNumber,
    };

    if (editingIndex !== null) {
      // Update existing card
      const updatedCards = [...playerCards];
      updatedCards[editingIndex] = newCard;
      setPlayerCards(updatedCards);
    } else {
      // Add new card at the left-most position
      if (playerCards.length < totalCards) {
        setPlayerCards([newCard, ...playerCards]);
      }
    }

    setSelectedColor(null);
    setSelectedNumber(null);
    setEditingIndex(null);
  };

  const handleCardClick = (index: number) => {
    const card = playerCards[index];
    if (card) {
      setEditingIndex(index);
      setSelectedColor(card.color);
      setSelectedNumber(card.number);
    }
  };

  const handleDeleteCard = (index: number) => {
    const updatedCards = playerCards.filter((_, i) => i !== index);
    setPlayerCards(updatedCards);
    if (editingIndex === index) {
      setEditingIndex(null);
      setSelectedColor(null);
      setSelectedNumber(null);
    }
  };

  const handleSave = () => {
    const updatedPlayers = gameState.players.map(p => {
      if (p.id === playerId) {
        return { ...p, hand: playerCards };
      }
      return p;
    });

    onUpdateGame({
      ...gameState,
      players: updatedPlayers,
    }, false); // Don't save card edits to undo history

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-black/20 backdrop-blur-sm p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-bold text-lg">Edit {player.name}'s Cards</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-white/60 text-xs mt-1">
            {playerCards.length}/{totalCards} cards
          </p>
        </div>

        {/* Cards Display */}
        <div className="p-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            {playerCards.map((card, index) => (
              <div key={card.id} className="relative">
                <div
                  className="cursor-pointer transition-all hover:scale-110"
                  onClick={() => handleCardClick(index)}
                >
                  <SmallCardPreview
                    card={card}
                    isEditing={editingIndex === index}
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(index);
                  }}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm flex items-center justify-center shadow-lg"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Placeholder cards */}
            {Array.from({ length: totalCards - playerCards.length }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="w-[60px] h-[84px] border border-dashed border-white/30 rounded-lg flex items-center justify-center text-white/40 text-lg"
              >
                ?
              </div>
            ))}
          </div>

          {/* Card Selection */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 space-y-3">
            <div className="text-center text-white text-xs font-medium">
              {editingIndex !== null ? 'Editing Card' : 'Add Card'}
            </div>

            <div className="flex gap-3">
              {/* Color Selection */}
              <div className="flex-1 space-y-1">
                <label className="text-white font-medium text-[10px]">Color</label>
                <div className="grid grid-cols-5 gap-1">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`aspect-square rounded-lg text-xl transition-all ${
                        selectedColor === color
                          ? 'bg-white shadow-md scale-110'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      {colorEmojis[color]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number Selection */}
              <div className="flex-1 space-y-1">
                <label className="text-white font-medium text-[10px]">Number</label>
                <div className="grid grid-cols-5 gap-1">
                  {NUMBERS.map(number => (
                    <button
                      key={number}
                      onClick={() => setSelectedNumber(number)}
                      className={`aspect-square rounded-lg font-bold text-base transition-all ${
                        selectedNumber === number
                          ? 'bg-white text-purple-900 shadow-md scale-110'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {editingIndex !== null && (
                <button
                  onClick={() => {
                    setEditingIndex(null);
                    setSelectedColor(null);
                    setSelectedNumber(null);
                  }}
                  className="flex-1 py-2 rounded-lg font-medium text-xs bg-white/20 text-white hover:bg-white/30 transition-all"
                >
                  Cancel
                </button>
              )}

              <button
                onClick={handleAddOrUpdateCard}
                disabled={!selectedColor || !selectedNumber || (editingIndex === null && playerCards.length >= totalCards)}
                className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all ${
                  selectedColor && selectedNumber && (editingIndex !== null || playerCards.length < totalCards)
                    ? editingIndex !== null
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-black/20 backdrop-blur-sm p-4 border-t border-white/10 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg font-medium text-sm bg-white/20 text-white hover:bg-white/30 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md transition-all"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
