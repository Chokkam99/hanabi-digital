'use client';

import { useState } from 'react';
import { GameState, Card, Color, CardNumber } from '@/types/game';
import { getHandSize } from '@/utils/gameInit';
import CardPicker from './CardPicker';
import { CardFace, EmptySlot } from './Card';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import Icon from './ui/Icon';

interface EditCardsModalProps {
  gameState: GameState;
  playerId: string;
  onClose: () => void;
  onUpdateGame: (newState: GameState, saveToHistory?: boolean) => void;
}

export default function EditCardsModal({ gameState, playerId, onClose, onUpdateGame }: EditCardsModalProps) {
  const player = gameState.players.find(p => p.id === playerId);

  const [playerCards, setPlayerCards] = useState<Card[]>(
    player && !player.isMe ? (player.hand as Card[]) : []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

  if (!player || player.isMe) {
    return null;
  }

  const totalCards = getHandSize(gameState.players.length);
  const canAdd = playerCards.length < totalCards;

  const resetPicker = () => {
    setEditingIndex(null);
    setSelectedColor(null);
    setSelectedNumber(null);
  };

  // A card is applied as soon as both its suit and number are picked
  const apply = (color: Color, number: CardNumber) => {
    if (editingIndex !== null) {
      // Update in place, keeping the id so clues it received stay attached
      setPlayerCards(cards => cards.map((card, i) => (i === editingIndex ? { ...card, color, number } : card)));
    } else if (canAdd) {
      // Fills the next empty slot, left to right
      const newCard: Card = {
        id: `card-${playerId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        color,
        number,
      };
      setPlayerCards(cards => [...cards, newCard]);
    }
    resetPicker();
  };

  const handleSelectColor = (color: Color) => {
    if (selectedNumber) apply(color, selectedNumber);
    else setSelectedColor(color);
  };

  const handleSelectNumber = (number: CardNumber) => {
    if (selectedColor) apply(selectedColor, number);
    else setSelectedNumber(number);
  };

  const handleCardClick = (index: number) => {
    if (editingIndex === index) {
      resetPicker();
      return;
    }
    setEditingIndex(index);
    setSelectedColor(playerCards[index].color);
    setSelectedNumber(playerCards[index].number);
  };

  const handleRemove = () => {
    if (editingIndex === null) return;
    setPlayerCards(cards => cards.filter((_, i) => i !== editingIndex));
    resetPicker();
  };

  const handleSave = () => {
    onUpdateGame(
      {
        ...gameState,
        players: gameState.players.map(p => (p.id === playerId ? { ...p, hand: playerCards } : p)),
      },
      false // Don't save card edits to undo history
    );
    onClose();
  };

  const hint =
    editingIndex !== null
      ? `Changing slot ${editingIndex + 1}: tap its new suit or number.`
      : canAdd
      ? `Pick a suit and number to add slot ${playerCards.length + 1}, or tap a card to change it.`
      : 'Tap a card to change or remove it.';

  return (
    <Sheet
      title={`${player.name}'s cards`}
      description={hint}
      onClose={onClose}
      footer={
        <>
          <Button className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-[2]" onClick={handleSave}>
            Save
          </Button>
        </>
      }
    >
      <ol className="mb-5 grid gap-2" style={{ gridTemplateColumns: `repeat(${totalCards}, minmax(0, 1fr))` }}>
        {playerCards.map((card, index) => (
          <li key={card.id} className="flex flex-col items-center gap-1">
            <button
              onClick={() => handleCardClick(index)}
              aria-pressed={editingIndex === index}
              aria-label={`Slot ${index + 1}`}
              className={`w-full max-w-16 rounded-[10%/6%] transition-transform duration-200 ${
                editingIndex === index ? '-translate-y-1 ring-2 ring-ink ring-offset-2 ring-offset-lacquer' : ''
              }`}
            >
              <CardFace color={card.color} number={card.number} />
            </button>
            <span className="text-xs font-semibold text-ink-2">{index + 1}</span>
          </li>
        ))}
        {Array.from({ length: totalCards - playerCards.length }, (_, i) => (
          <li key={`empty-${i}`} className="flex flex-col items-center gap-1">
            <div className={`w-full max-w-16 ${i === 0 && editingIndex === null ? 'rounded-[10%/6%] ring-2 ring-ink/60 ring-offset-2 ring-offset-lacquer' : ''}`}>
              <EmptySlot />
            </div>
            <span className="text-xs font-semibold text-ink-2">{playerCards.length + i + 1}</span>
          </li>
        ))}
      </ol>

      <CardPicker
        selectedColor={selectedColor}
        selectedNumber={selectedNumber}
        onSelectColor={handleSelectColor}
        onSelectNumber={handleSelectNumber}
      />

      {editingIndex !== null && (
        <button
          onClick={handleRemove}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-ink-2 underline-offset-4 hover:text-ink hover:underline"
        >
          <Icon name="discard" size={16} />
          Remove slot {editingIndex + 1}
        </button>
      )}
    </Sheet>
  );
}
