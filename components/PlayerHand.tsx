'use client';

import { useState } from 'react';
import { Player, GameState, CardPossibilities, Card, Color, CardNumber, ClueType } from '@/types/game';
import CardDisplay from './CardDisplay';
import RevealCardModal from './RevealCardModal';
import HintControlPanel from './HintControlPanel';
import DeductionModal from './DeductionModal';
import { computePlayerKnowledge, getFinalPossibilities } from '@/utils/inference';
import { giveClue } from '@/utils/gameActions';

interface PlayerHandProps {
  player: Player;
  isMyHand: boolean;
  showKnowledge: boolean; // Show possibilities/clues
  gameState: GameState;
  onUpdateGame: (newState: GameState) => void;
}

export default function PlayerHand({
  player,
  isMyHand,
  showKnowledge,
  gameState,
  onUpdateGame,
}: PlayerHandProps) {
  // State for card selection (hints)
  const [selectedPositions, setSelectedPositions] = useState<number[]>([]);

  // State for reveal modal (play/discard)
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealAction, setRevealAction] = useState<{type: 'play' | 'discard', position: number} | null>(null);

  // State for deduction modal
  const [showDeductionModal, setShowDeductionModal] = useState(false);

  // Handlers for play/discard actions
  const handlePlay = (position: number) => {
    setRevealAction({ type: 'play', position });
    setShowRevealModal(true);
  };

  const handleDiscard = (position: number) => {
    setRevealAction({ type: 'discard', position });
    setShowRevealModal(true);
  };

  // Handler for card selection (for hints)
  const handleToggleSelect = (position: number) => {
    setSelectedPositions(prev =>
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  // Handler for giving hints
  const handleGiveHint = (type: ClueType, value: Color | CardNumber) => {
    try {
      const newState = giveClue(
        gameState,
        player.id,
        selectedPositions,
        type,
        value
      );
      onUpdateGame(newState);
      setSelectedPositions([]);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to give hint');
    }
  };

  // Handler for reordering cards
  const handleMoveCard = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= player.hand.length) return;

    if (player.isMe) {
      const newHand = [...(player.hand as CardPossibilities[])];
      [newHand[fromIndex], newHand[toIndex]] = [newHand[toIndex], newHand[fromIndex]];

      // Update positions immutably
      const reindexedHand = newHand.map((card, idx) => ({
        ...card,
        position: idx,
      }));

      const updatedPlayers = gameState.players.map(p =>
        p.id === player.id ? { ...p, hand: reindexedHand } : p
      );

      onUpdateGame({ ...gameState, players: updatedPlayers });
    } else {
      const newHand = [...(player.hand as Card[])];
      [newHand[fromIndex], newHand[toIndex]] = [newHand[toIndex], newHand[fromIndex]];

      const updatedPlayers = gameState.players.map(p =>
        p.id === player.id ? { ...p, hand: newHand } : p
      );

      onUpdateGame({ ...gameState, players: updatedPlayers });
    }
  };

  // Toggle deduction display
  const handleToggleDeductions = () => {
    onUpdateGame({
      ...gameState,
      settings: {
        ...gameState.settings,
        showDeductions: !gameState.settings.showDeductions,
      },
    });
  };

  // Calculate expected hand size based on player count
  const expectedHandSize = gameState.players.length <= 3 ? 5 : 4;

  // Compute what this player knows if we're viewing their knowledge
  // For "me", use the actual CardPossibilities in their hand
  // For other players, compute from clues received
  const displayHand: (CardPossibilities | Card)[] = (() => {
    if (showKnowledge && !isMyHand) {
      // Viewing another player's knowledge
      // Their hand should be Card[] (visible cards)
      if (player.isMe) {
        // This shouldn't happen - if isMyHand is false, player.isMe should also be false
        console.error('Logic error: viewing other player but player.isMe is true');
        return player.hand as (CardPossibilities | Card)[];
      }

      const currentHand = player.hand as Card[];
      let knowledgeHand: CardPossibilities[];

      // If the player's hand is empty, create placeholder possibilities
      if (currentHand.length === 0) {
        knowledgeHand = Array.from({ length: expectedHandSize }, (_, position) => ({
          id: `placeholder-${player.id}-${position}`,
          position,
          possibleColors: new Set(['red', 'yellow', 'green', 'blue', 'white'] as Color[]),
          possibleNumbers: new Set([1, 2, 3, 4, 5] as CardNumber[]),
        }));
      } else {
        knowledgeHand = computePlayerKnowledge(currentHand, player.cluesReceived);
      }

      // Fill remaining slots with placeholders if needed
      if (knowledgeHand.length < expectedHandSize) {
        const placeholders = Array.from(
          { length: expectedHandSize - knowledgeHand.length },
          (_, i) => ({
            id: `placeholder-${player.id}-${knowledgeHand.length + i}`,
            position: knowledgeHand.length + i,
            possibleColors: new Set(['red', 'yellow', 'green', 'blue', 'white'] as Color[]),
            possibleNumbers: new Set([1, 2, 3, 4, 5] as CardNumber[]),
          })
        );
        return [...knowledgeHand, ...placeholders];
      }

      return knowledgeHand;
    }

    // For other players (not viewing knowledge), show actual cards + placeholders
    if (!isMyHand && !player.isMe) {
      const currentHand = player.hand as Card[];

      // Fill remaining slots with placeholder cards if needed
      if (currentHand.length < expectedHandSize) {
        const placeholders = Array.from(
          { length: expectedHandSize - currentHand.length },
          (_, i) => ({
            id: `placeholder-${player.id}-${currentHand.length + i}`,
            color: 'white' as Color,
            number: 0 as any, // Placeholder number (invalid, will be detected as placeholder)
          })
        );
        return [...currentHand, ...placeholders];
      }

      return currentHand;
    }

    // For my hand, apply deductions if enabled
    if (isMyHand && gameState.settings.showDeductions && player.isMe) {
      return (player.hand as CardPossibilities[]).map(card => {
        const finalPossibilities = getFinalPossibilities(card);
        return {
          ...card,
          possibleColors: finalPossibilities.colors,
          possibleNumbers: finalPossibilities.numbers,
        };
      });
    }

    return player.hand as (CardPossibilities | Card)[];
  })();

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-lg">
          {isMyHand ? '🙈 My Hand (Unknown)' : `👁️ ${player.name}'s Hand`}
        </h2>

        {/* Controls (only for my hand) */}
        {isMyHand && player.isMe && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleDeductions}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                gameState.settings.showDeductions
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/20 text-white/70'
              }`}
            >
              🧠 {gameState.settings.showDeductions ? 'ON' : 'OFF'}
            </button>
            {gameState.settings.showDeductions && (
              <button
                onClick={() => setShowDeductionModal(true)}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all active:scale-95"
              >
                Manage
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cards - Horizontal Scroll */}
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
          {displayHand.map((card, index) => {
            // Check if this is a placeholder card (only show reorder buttons for actual cards)
            const isPlaceholder = index >= player.hand.length;

            return (
              <div key={'id' in card ? card.id : `${(card as Card).color}-${(card as Card).number}-${index}`} className="flex-shrink-0 snap-center">
                <div className="relative">
                  {/* Reorder buttons - only for actual cards, not placeholders */}
                  {!isPlaceholder ? (
                    <div className="flex gap-1 mb-1 justify-center">
                      <button
                        onClick={() => handleMoveCard(index, 'left')}
                        disabled={index === 0}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                          index === 0
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-white/20 hover:bg-white/30 text-white active:scale-95'
                        }`}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => handleMoveCard(index, 'right')}
                        disabled={index === player.hand.length - 1}
                        className={`px-2 py-0.5 rounded text-xs font-semibold transition-all ${
                          index === player.hand.length - 1
                            ? 'bg-white/10 text-white/30 cursor-not-allowed'
                            : 'bg-white/20 hover:bg-white/30 text-white active:scale-95'
                        }`}
                      >
                        →
                      </button>
                    </div>
                  ) : (
                    <div className="h-[28px] mb-1" />
                  )}

                  <CardDisplay
                    card={card}
                    position={index}
                    isMyHand={isMyHand}
                    showKnowledge={showKnowledge}
                    gameState={gameState}
                    // Action buttons for play/discard
                    showActionButtons={true}
                    onPlay={handlePlay}
                    onDiscard={handleDiscard}
                    // Selection for hints (enabled for all players)
                    isSelected={selectedPositions.includes(index)}
                    onToggleSelect={handleToggleSelect}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hint Control Panel (for all players with selections) */}
      {selectedPositions.length > 0 && (
        <HintControlPanel
          selectedPositions={selectedPositions}
          playerName={isMyHand ? 'Me' : player.name}
          hintTokens={gameState.hintTokens}
          onClearSelection={() => setSelectedPositions([])}
          onSubmit={handleGiveHint}
        />
      )}

      {/* Clue History (always show for my hand, or when viewing knowledge) */}
      {(isMyHand || showKnowledge) && player.cluesReceived.length > 0 && (
        <div className="bg-white/5 rounded-xl p-3 space-y-2">
          <h3 className="text-white/70 font-semibold text-xs uppercase">Clues Received</h3>
          <div className="space-y-1">
            {player.cluesReceived.slice(-3).map((clue) => {
              // Find which current positions match the card IDs from the clue
              const positions = clue.cardIds
                .map(cardId => player.hand.findIndex(c => c.id === cardId))
                .filter(pos => pos !== -1)
                .map(pos => pos + 1);

              return (
                <div key={clue.id} className="text-white/60 text-xs">
                  {clue.type === 'color' ? '🎨' : '🔢'} {clue.value}
                  {positions.length > 0 && ` (cards ${positions.join(', ')})`}
                </div>
              );
            })}
            {player.cluesReceived.length > 3 && (
              <div className="text-white/40 text-xs">
                +{player.cluesReceived.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reveal Card Modal */}
      {showRevealModal && revealAction && (
        <RevealCardModal
          playerId={player.id}
          position={revealAction.position}
          actionType={revealAction.type}
          gameState={gameState}
          onClose={() => setShowRevealModal(false)}
          onUpdateGame={onUpdateGame}
        />
      )}

      {/* Deduction Modal */}
      {showDeductionModal && (
        <DeductionModal
          gameState={gameState}
          onClose={() => setShowDeductionModal(false)}
          onUpdateGame={onUpdateGame}
        />
      )}
    </div>
  );
}
