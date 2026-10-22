'use client';

import { useState } from 'react';
import { GameState, Color, CardNumber, CardPossibilities } from '@/types/game';
import { playCard, discardCard } from '@/utils/gameActions';
import { getMyKnowledge } from '@/utils/inference';
import CardPicker from './CardPicker';
import { CardFace, KnowledgeCard } from './Card';
import Sheet from './ui/Sheet';
import Button from './ui/Button';
import Icon from './ui/Icon';

interface RevealCardModalProps {
  playerId: string;
  position: number;
  actionType: 'play' | 'discard';
  gameState: GameState;
  onClose: () => void;
  onUpdateGame: (newState: GameState) => void;
}

/**
 * Playing or discarding my own card: enter what it turned out to be
 */
export default function RevealCardModal({
  playerId,
  position,
  actionType,
  gameState,
  onClose,
  onUpdateGame,
}: RevealCardModalProps) {
  const player = gameState.players.find(p => p.id === playerId);

  // Pre-fill whatever is already pinned down about my card (clues, plus deductions when they're on)
  const myCard: CardPossibilities | undefined = player?.isMe ? getMyKnowledge(gameState).hand[position] : undefined;
  const [selectedColor, setSelectedColor] = useState<Color | null>(
    myCard?.possibleColors.size === 1 ? [...myCard.possibleColors][0] : null
  );
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(
    myCard?.possibleNumbers.size === 1 ? [...myCard.possibleNumbers][0] : null
  );
  const [error, setError] = useState<string | null>(null);

  if (!player || !myCard) {
    return null;
  }

  const handleSubmit = () => {
    if (!selectedColor || !selectedNumber) return;
    try {
      const action = actionType === 'play' ? playCard : discardCard;
      onUpdateGame(action(gameState, playerId, position, selectedColor, selectedNumber));
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  const verb = actionType === 'play' ? 'Play' : 'Discard';
  const willSucceed =
    actionType === 'play' && selectedColor && selectedNumber
      ? gameState.fireworks[selectedColor] + 1 === selectedNumber
      : null;

  return (
    <Sheet
      title={`${verb} your slot ${position + 1}`}
      description="Turn it over: what is it?"
      onClose={onClose}
      footer={
        <>
          <Button className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="flex-[2]"
            icon={actionType === 'play' ? 'play' : 'discard'}
            disabled={!selectedColor || !selectedNumber}
            onClick={handleSubmit}
          >
            {verb}
          </Button>
        </>
      }
    >
      <div className="flex gap-4">
        <div className="w-16 shrink-0">
          {selectedColor && selectedNumber ? (
            <CardFace color={selectedColor} number={selectedNumber} />
          ) : (
            <KnowledgeCard possibleColors={myCard.possibleColors} possibleNumbers={myCard.possibleNumbers} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <CardPicker
            selectedColor={selectedColor}
            selectedNumber={selectedNumber}
            onSelectColor={setSelectedColor}
            onSelectNumber={setSelectedNumber}
            likelyColors={myCard.possibleColors}
            likelyNumbers={myCard.possibleNumbers}
          />
        </div>
      </div>

      {willSucceed !== null && (
        <p className={`mt-4 flex items-start gap-2 text-sm ${willSucceed ? 'text-ink-2' : 'font-semibold text-ink'}`}>
          {!willSucceed && <Icon name="close" size={16} className="mt-0.5 shrink-0 [stroke-width:2.5]" />}
          {willSucceed
            ? 'This continues its firework.'
            : "This doesn't fit its firework: it'll cost a strike and go to the discards."}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-ink">
          {error}
        </p>
      )}
    </Sheet>
  );
}
