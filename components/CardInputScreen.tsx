'use client';

import { useEffect, useState } from 'react';
import { GameState, Color, CardNumber, Card } from '@/types/game';
import { getHandSize } from '@/utils/gameInit';
import CardPicker from './CardPicker';
import { CardFace, EmptySlot } from './Card';
import Button from './ui/Button';

interface CardInputScreenProps {
  gameState: GameState;
  onComplete: (updatedState: GameState, saveToHistory?: boolean) => void;
}

export default function CardInputScreen({ gameState, onComplete }: CardInputScreenProps) {
  const otherPlayers = gameState.players.filter(p => !p.isMe);
  const totalCards = getHandSize(gameState.players.length);

  // State for tracking all players' cards locally
  const [allPlayersCards, setAllPlayersCards] = useState<Map<string, Card[]>>(
    () => new Map<string, Card[]>(otherPlayers.map(p => [p.id, []]))
  );
  const [editingCard, setEditingCard] = useState<{ playerId: string; index: number } | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<CardNumber | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>(otherPlayers[0]?.id || '');

  // Keep the hand being entered in view above the picker
  useEffect(() => {
    const section = document.getElementById(`deal-section-${currentPlayerId}`);
    if (!section) return;
    const pickerTop = window.innerHeight - 400;
    const rect = section.getBoundingClientRect();
    if (rect.bottom > pickerTop || rect.top < 80) {
      section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentPlayerId]);

  const cardsFor = (playerId: string) => allPlayersCards.get(playerId) || [];
  const totalEntered = otherPlayers.reduce((sum, p) => sum + cardsFor(p.id).length, 0);
  const totalNeeded = otherPlayers.length * totalCards;
  const isComplete = totalEntered === totalNeeded;
  const currentPlayer = otherPlayers.find(p => p.id === currentPlayerId);

  const resetPicker = () => {
    setSelectedColor(null);
    setSelectedNumber(null);
    setEditingCard(null);
  };

  // A card is entered as soon as both its suit and number are picked
  const apply = (color: Color, number: CardNumber) => {
    const playerCards = cardsFor(currentPlayerId);
    const newMap = new Map(allPlayersCards);

    if (editingCard && editingCard.playerId === currentPlayerId) {
      // Update existing card, keeping its id
      newMap.set(
        currentPlayerId,
        playerCards.map((card, i) => (i === editingCard.index ? { ...card, color, number } : card))
      );
    } else if (playerCards.length < totalCards) {
      // Cards are entered left to right, in the order they appear in the hand
      const newCard: Card = {
        id: `card-${currentPlayerId}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        color,
        number,
      };
      newMap.set(currentPlayerId, [...playerCards, newCard]);

      // Move on to the next player once this hand is full
      if (playerCards.length + 1 >= totalCards) {
        const next = otherPlayers.find(p => (newMap.get(p.id) || []).length < totalCards);
        if (next) setCurrentPlayerId(next.id);
      }
    }

    setAllPlayersCards(newMap);
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

  const handleCardClick = (playerId: string, cardIndex: number) => {
    const card = cardsFor(playerId)[cardIndex];
    if (editingCard?.playerId === playerId && editingCard.index === cardIndex) {
      resetPicker();
      return;
    }
    setEditingCard({ playerId, index: cardIndex });
    setSelectedColor(card.color);
    setSelectedNumber(card.number);
    setCurrentPlayerId(playerId);
  };

  const handleStartGame = () => {
    onComplete(
      {
        ...gameState,
        players: gameState.players.map(p => (p.isMe ? p : { ...p, hand: cardsFor(p.id) })),
        needsCardInput: false,
      },
      false // Don't save card input to undo history
    );
  };

  const prompt = editingCard
    ? `Changing ${currentPlayer?.name}'s slot ${editingCard.index + 1}`
    : currentPlayer && cardsFor(currentPlayer.id).length < totalCards
    ? `${currentPlayer.name}, slot ${cardsFor(currentPlayer.id).length + 1}`
    : 'Every hand is entered';

  return (
    <main className="min-h-dvh bg-mat pb-[25rem]">
      <header className="sticky top-0 z-20 border-b border-rule bg-lacquer/95 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4 backdrop-blur-md">
        <div className="mx-auto max-w-xl">
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="text-xl font-semibold tracking-tight [font-stretch:92%]">The hands you can see</h1>
            <span className="text-sm text-ink-2">
              {totalEntered} of {totalNeeded}
            </span>
          </div>
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-lacquer-3"
            role="progressbar"
            aria-valuenow={totalEntered}
            aria-valuemax={totalNeeded}
            aria-label="Cards entered"
          >
            <div
              className="h-full rounded-full bg-ink transition-[width] duration-300 ease-out"
              style={{ width: `${(totalEntered / totalNeeded) * 100}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-xl space-y-3 px-5 pt-5">
        <p className="text-[13px] text-ink-2">Enter each hand left to right as you see it. Tap a card to fix it.</p>
        {otherPlayers.map(player => {
          const playerCards = cardsFor(player.id);
          const isActive = currentPlayerId === player.id;

          return (
            <section
              key={player.id}
              id={`deal-section-${player.id}`}
              aria-labelledby={`deal-${player.id}`}
              className={`rounded-2xl border p-4 transition-colors duration-200 ${
                isActive ? 'border-ink-3 bg-lacquer' : 'border-rule'
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 id={`deal-${player.id}`} className="font-semibold">
                  <button
                    onClick={() => {
                      setCurrentPlayerId(player.id);
                      setEditingCard(null);
                    }}
                    className="hover:underline"
                  >
                    {player.name}
                  </button>
                </h2>
                <span className="text-sm text-ink-2">
                  {playerCards.length}/{totalCards}
                </span>
              </div>

              <ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${totalCards}, minmax(0, 1fr))` }}>
                {playerCards.map((card, index) => {
                  const editing = editingCard?.playerId === player.id && editingCard.index === index;
                  return (
                    <li key={card.id}>
                      <button
                        onClick={() => handleCardClick(player.id, index)}
                        aria-pressed={editing}
                        aria-label={`${player.name} slot ${index + 1}`}
                        className={`w-full max-w-16 rounded-[10%/6%] transition-transform duration-200 ${
                          editing ? '-translate-y-1 ring-2 ring-ink ring-offset-2 ring-offset-lacquer' : ''
                        }`}
                      >
                        <CardFace color={card.color} number={card.number} />
                      </button>
                    </li>
                  );
                })}
                {Array.from({ length: totalCards - playerCards.length }, (_, i) => {
                  const next = isActive && !editingCard && i === 0;
                  return (
                    <li key={`empty-${i}`}>
                      <button
                        onClick={() => {
                          setCurrentPlayerId(player.id);
                          setEditingCard(null);
                        }}
                        aria-label={`Enter ${player.name}'s slot ${playerCards.length + i + 1}`}
                        className={`block w-full max-w-16 rounded-[10%/6%] ${next ? 'ring-2 ring-ink ring-offset-2 ring-offset-lacquer' : ''}`}
                      >
                        <EmptySlot />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30">
        <div className="mx-auto max-w-xl rounded-t-2xl border border-b-0 border-rule bg-lacquer-2 px-5 pt-4 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <p className="mb-3 text-sm font-semibold" aria-live="polite">
            {prompt}
          </p>
          <CardPicker
            selectedColor={selectedColor}
            selectedNumber={selectedNumber}
            onSelectColor={handleSelectColor}
            onSelectNumber={handleSelectNumber}
          />
          <Button variant={isComplete ? 'primary' : 'secondary'} size="lg" className="mt-4 w-full" onClick={handleStartGame}>
            {isComplete ? 'Start the game' : `Start with ${totalEntered} of ${totalNeeded}`}
          </Button>
          {!isComplete && (
            <p className="mt-2 text-center text-xs text-ink-2">You can add missing cards during the game.</p>
          )}
        </div>
      </div>
    </main>
  );
}
