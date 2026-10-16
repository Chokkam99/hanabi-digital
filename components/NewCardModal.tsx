'use client';

import { useState } from 'react';
import { GameState, Color, CardNumber, Card } from '@/types/game';
import CardPicker from './CardPicker';
import { CardFace, EmptySlot } from './Card';
import Sheet from './ui/Sheet';
import Button from './ui/Button';

interface NewCardModalProps {
  gameState: GameState;
  onUpdateGame: (newState: GameState) => void;
  // Lets the user back out of the play/discard that triggered this modal
  onUndo?: () => void;
  // Dismiss without entering a card (it can be added later with Edit Cards)
  onSkip: () => void;
}

export default function NewCardModal({ gameState, onUpdateGame, onUndo, onSkip }: NewCardModalProps) {
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);

  if (!gameState.pendingCardInput) return null;

  const player = gameState.players.find(p => p.id === gameState.pendingCardInput!.playerId);
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
      description="What is it? It goes into slot 1."
      footer={
        <>
          {/* Undo history isn't saved, so after a reload offer a way out instead */}
          <Button className="flex-1" icon={onUndo ? 'undo' : undefined} onClick={onUndo ?? onSkip}>
            {onUndo ? 'Undo' : 'Add later'}
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
