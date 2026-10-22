'use client';

import { useState } from 'react';
import { GameState, Color, CardNumber, Card } from '@/types/game';
import CardPicker from './CardPicker';
import { CardFace, EmptySlot } from './Card';
import Sheet from './ui/Sheet';
import Button from './ui/Button';

interface NewCardModalProps {
  gameState: GameState;
  playerId: string;
  onUpdateGame: (newState: GameState) => void;
  // The other footer action: Undo the play that drew it, put it off, or close (when opened from its slot)
  secondary: { label: string; icon?: 'undo'; onClick: () => void };
}

export default function NewCardModal({ gameState, playerId, onUpdateGame, secondary }: NewCardModalProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

  const player = gameState.players.find(p => p.id === playerId);
  if (!player) return null;

  const handleSubmit = () => {
    if (!selectedColor || !selectedNumber) {
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
          cardsToEnter: Math.max((p.cardsToEnter ?? 1) - 1, 0),
        };
      }
      return p;
    });

    onUpdateGame({
      ...gameState,
      players: updatedPlayers,
      pendingCardInput: undefined,
    });
  };

  return (
    <Sheet
      title={`${player.name} drew a card`}
      description={`What is it? It goes into slot ${Math.max(player.cardsToEnter ?? 1, 1)}.`}
      footer={
        <>
          <Button className="flex-1" icon={secondary.icon} onClick={secondary.onClick}>
            {secondary.label}
          </Button>
          <Button variant="primary" className="flex-[2]" disabled={!selectedColor || !selectedNumber} onClick={handleSubmit}>
            Add card
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="w-16 shrink-0">
          {selectedColor && selectedNumber ? (
            <CardFace color={selectedColor} number={selectedNumber} />
          ) : (
            <EmptySlot label="?" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CardPicker
            selectedColor={selectedColor}
            selectedNumber={selectedNumber}
            onSelectColor={setSelectedColor}
            onSelectNumber={setSelectedNumber}
          />
        </div>
      </div>
    </Sheet>
  );
}
