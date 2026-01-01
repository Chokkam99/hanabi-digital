'use client';

import { useState, useEffect } from 'react';
import { GameState, Player, Color, CardNumber, COLORS, NUMBERS, Card } from '@/types/game';
import SmallCardPreview from './SmallCardPreview';

interface CardInputScreenProps {
  gameState: GameState;
  onComplete: (updatedState: GameState, saveToHistory?: boolean) => void;
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

export default function CardInputScreen({ gameState, onComplete }: CardInputScreenProps) {
  const otherPlayers = gameState.players.filter(p => !p.isMe);
  const totalCards = gameState.players.length <= 3 ? 5 : 4;

  // State for tracking all players' cards locally
  const [allPlayersCards, setAllPlayersCards] = useState<Map<string, Card[]>>(new Map());
  const [editingCard, setEditingCard] = useState<{playerId: string, index: number} | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(otherPlayers[0]?.id || '');

  // Initialize the map with empty arrays for each player
  useEffect(() => {
    const initialMap = new Map<string, Card[]>();
    otherPlayers.forEach(p => {
      initialMap.set(p.id, []);
    });
    setAllPlayersCards(initialMap);
  }, []);

  const handleAddOrUpdateCard = () => {
    if (!selectedColor || !selectedNumber) {
      return;
    }

    const newCard: Card = {
      id: `card-${currentPlayerId}-${Date.now()}`,
      color: selectedColor,
      number: selectedNumber,
    };

    setAllPlayersCards(prev => {
      const newMap = new Map(prev);
      const playerCards = newMap.get(currentPlayerId) || [];

      if (editingCard && editingCard.playerId === currentPlayerId) {
        // Update existing card
        const updatedCards = [...playerCards];
        updatedCards[editingCard.index] = newCard;
        newMap.set(currentPlayerId, updatedCards);
      } else {
        // Add new card at the left-most position - only if player doesn't have max cards already
        if (playerCards.length < totalCards) {
          newMap.set(currentPlayerId, [newCard, ...playerCards]);
        }
      }

      return newMap;
    });

    // Reset selection
    setSelectedColor(null);
    setSelectedNumber(null);
    setEditingCard(null);

    // Auto-advance to next player if current player's hand is complete
    if (!editingCard) {
      const currentCards = allPlayersCards.get(currentPlayerId) || [];
      if (currentCards.length + 1 >= totalCards) {
        const currentIndex = otherPlayers.findIndex(p => p.id === currentPlayerId);
        if (currentIndex < otherPlayers.length - 1) {
          setCurrentPlayerId(otherPlayers[currentIndex + 1].id);
        }
      }
    }
  };

  const handleCardClick = (playerId: string, cardIndex: number) => {
    const playerCards = allPlayersCards.get(playerId) || [];
    const card = playerCards[cardIndex];

    if (card) {
      setEditingCard({ playerId, index: cardIndex });
      setSelectedColor(card.color);
      setSelectedNumber(card.number);
      setCurrentPlayerId(playerId);
    }
  };

  const handleStartGame = () => {
    // Copy all cards to gameState
    const updatedPlayers = gameState.players.map(p => {
      if (p.isMe) return p;

      const cards = allPlayersCards.get(p.id) || [];
      return {
        ...p,
        hand: cards,
      };
    });

    onComplete({
      ...gameState,
      players: updatedPlayers,
      needsCardInput: false,
    }, false); // Don't save card input to undo history
  };

  const getTotalEntered = () => {
    let total = 0;
    allPlayersCards.forEach(cards => {
      total += cards.length;
    });
    return total;
  };

  const isComplete = () => {
    return otherPlayers.every(p => {
      const cards = allPlayersCards.get(p.id) || [];
      return cards.length === totalCards;
    });
  };

  const progress = (getTotalEntered() / (otherPlayers.length * totalCards)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-3 flex flex-col gap-3">
      {/* Header */}
      <div className="text-center max-w-4xl mx-auto w-full">
        <h1 className="text-lg font-bold text-white mb-1">Enter Initial Cards</h1>
        <p className="text-white/70 text-xs mb-2">
          {getTotalEntered()} of {otherPlayers.length * totalCards} cards
        </p>
        {/* Progress Bar */}
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Player Hands Display */}
      <div className="space-y-1.5 max-w-4xl mx-auto w-full">
        <h2 className="text-white font-semibold text-sm px-1">Other Players</h2>
        {otherPlayers.map((player) => {
          const playerCards = allPlayersCards.get(player.id) || [];
          const isActive = currentPlayerId === player.id;
          const isPlayerComplete = playerCards.length === totalCards;

          return (
            <div
              key={player.id}
              className={`bg-white/10 backdrop-blur-md rounded-lg p-2 transition-all duration-300 cursor-pointer ${
                isActive ? 'ring-1 ring-green-400 shadow-md' : 'hover:bg-white/15'
              }`}
              onClick={() => !isPlayerComplete && setCurrentPlayerId(player.id)}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-medium text-[10px]">
                  {player.name}
                </span>
                {isPlayerComplete && (
                  <span className="text-green-400 text-xs">✓</span>
                )}
                <span className="text-white/60 text-[10px] ml-auto">
                  {playerCards.length}/{totalCards}
                </span>
              </div>

              {/* Cards Display */}
              <div className="flex gap-1 overflow-x-auto pb-0.5">
                {playerCards.map((card, index) => (
                  <div
                    key={card.id}
                    className="flex-shrink-0 cursor-pointer transition-all hover:scale-110 active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(player.id, index);
                    }}
                  >
                    <SmallCardPreview
                      card={card}
                      isEditing={editingCard?.playerId === player.id && editingCard?.index === index}
                    />
                  </div>
                ))}

                {/* Placeholder cards */}
                {Array.from({ length: totalCards - playerCards.length }).map((_, i) => (
                  <div
                    key={`placeholder-${i}`}
                    className="w-[60px] h-[84px] border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center text-white/40 text-2xl flex-shrink-0 bg-white/5"
                  >
                    ?
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Selection Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 space-y-3 max-w-sm mx-auto w-full">
        <div className="text-center">
          <h3 className="text-white font-medium text-xs">
            {editingCard ? (
              <>Editing</>
            ) : (
              <>
                {otherPlayers.find(p => p.id === currentPlayerId)?.name}
              </>
            )}
          </h3>
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
                  className={`aspect-square rounded-lg text-2xl transition-all ${
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
                  className={`aspect-square rounded-lg font-bold text-lg transition-all ${
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

        {/* Selected Card Preview */}
        {selectedColor && selectedNumber && (
          <div className="bg-white/10 rounded-lg p-2 text-center flex items-center justify-center gap-2">
            <div className="text-3xl">{colorEmojis[selectedColor]}</div>
            <div className="text-2xl font-bold text-white">{selectedNumber}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          {editingCard && (
            <button
              onClick={() => {
                setEditingCard(null);
                setSelectedColor(null);
                setSelectedNumber(null);
              }}
              className="flex-1 py-2 rounded-lg font-medium text-xs bg-white/20 text-white hover:bg-white/30 transition-all active:scale-95"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleAddOrUpdateCard}
            disabled={!selectedColor || !selectedNumber || (!editingCard && (allPlayersCards.get(currentPlayerId)?.length || 0) >= totalCards)}
            className={`flex-1 py-2 rounded-lg font-medium text-xs transition-all ${
              selectedColor && selectedNumber && (editingCard || (allPlayersCards.get(currentPlayerId)?.length || 0) < totalCards)
                ? editingCard
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md active:scale-95'
                  : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md active:scale-95'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {editingCard ? 'Update' : 'Add →'}
          </button>
        </div>

        {/* Start Game Buttons */}
        <div className="space-y-2">
          {!isComplete() && (
            <p className="text-white/60 text-xs text-center">
              💡 You can add missing cards later during the game
            </p>
          )}

          <div className="flex gap-2">
            {isComplete() ? (
              <button
                onClick={handleStartGame}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md active:scale-95 animate-pulse"
              >
                Start Game! 🚀
              </button>
            ) : (
              <button
                onClick={handleStartGame}
                className="w-full py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md active:scale-95"
              >
                Start Game ({getTotalEntered()} cards entered) →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
