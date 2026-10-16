'use client';

import { useEffect, useRef, useState } from 'react';
import { GameState, Color, CardNumber, ClueType, Card, CardPossibilities, COLORS, MAX_SCORE, MAX_STRIKES, GameSettings } from '@/types/game';
import { giveClue, playCard, discardCard } from '@/utils/gameActions';
import { getHandSize } from '@/utils/gameInit';
import TableHeader from './TableHeader';
import FireworksRail from './FireworksRail';
import PlayerHand from './PlayerHand';
import ActionDock from './ActionDock';
import DiscardPileDisplay from './DiscardPileDisplay';
import NewCardModal from './NewCardModal';
import EditCardsModal from './EditCardsModal';
import RevealCardModal from './RevealCardModal';
import DeductionModal from './DeductionModal';
import { CardFace, EmptySlot } from './Card';
import { SUIT_NAMES, SUIT_TEXT } from './SuitEmblem';
import Sheet from './ui/Sheet';
import SwitchRow from './ui/Switch';
import Button from './ui/Button';
import Icon from './ui/Icon';

interface GameViewProps {
  gameState: GameState;
  onUpdateGame: (newState: GameState, saveToHistory?: boolean) => void;
  onUndo: () => void;
  canUndo: boolean;
  onNewGame: () => void;
}

type Selection = { playerId: string; cardIds: string[] } | null;

// Degrees between neighbouring cards in the final fan, centred on the middle suit
const FAN_STEP = 8;

export default function GameView({ gameState, onUpdateGame, onUndo, canUndo, onNewGame }: GameViewProps) {
  const [selection, setSelection] = useState<Selection>(null);
  const [reveal, setReveal] = useState<{ position: number; type: 'play' | 'discard' } | null>(null);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [showDeductions, setShowDeductions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [confirmingNewGame, setConfirmingNewGame] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const { players, settings } = gameState;
  const handSize = getHandSize(players.length);

  // My hand first, then everyone else in turn order after me
  const meIndex = players.findIndex(p => p.isMe);
  const me = players[meIndex];
  const others = [...players.slice(meIndex + 1), ...players.slice(0, meIndex)];

  const selectedPlayer = selection ? players.find(p => p.id === selection.playerId) : undefined;
  // Positions follow the cards, so a selection survives reordering
  const selectedPositions = selectedPlayer
    ? (selectedPlayer.hand as (Card | CardPossibilities)[])
        .map((card, index) => (selection!.cardIds.includes(card.id) ? index : -1))
        .filter(index => index !== -1)
    : [];
  const activeSelection = selectedPlayer && selectedPositions.length > 0;

  // When a hand is selected, make sure the dock isn't covering it
  const selectedHandId = selection?.playerId;
  useEffect(() => {
    if (!selectedHandId) return;
    const section = document.getElementById(`hand-section-${selectedHandId}`);
    if (!section) return;
    const dockTop = window.innerHeight - 340;
    if (section.getBoundingClientRect().bottom > dockTop) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedHandId]);

  // A perfect game bursts only when it ends at the table, never when a finished game is reloaded
  const wasOver = useRef(gameState.isGameOver);
  const [justEnded, setJustEnded] = useState(false);
  useEffect(() => {
    if (gameState.isGameOver === wasOver.current) return;
    wasOver.current = gameState.isGameOver;
    setJustEnded(gameState.isGameOver);
  }, [gameState.isGameOver]);

  const run = (action: () => GameState, saveToHistory = true) => {
    try {
      onUpdateGame(action(), saveToHistory);
      setSelection(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Something went wrong.');
    }
  };

  const toggleCard = (playerId: string, cardId: string) => {
    setNotice(null);
    setSelection(prev => {
      // Selecting in another hand starts a fresh selection
      if (!prev || prev.playerId !== playerId) return { playerId, cardIds: [cardId] };
      const cardIds = prev.cardIds.includes(cardId)
        ? prev.cardIds.filter(id => id !== cardId)
        : [...prev.cardIds, cardId];
      return cardIds.length > 0 ? { playerId, cardIds } : null;
    });
  };

  const selectPositions = (positions: number[]) => {
    if (!selectedPlayer) return;
    setSelection({ playerId: selectedPlayer.id, cardIds: positions.map(p => selectedPlayer.hand[p].id) });
  };

  const handleClue = (type: ClueType, value: Color | CardNumber) => {
    if (!selectedPlayer) return;
    run(() => giveClue(gameState, selectedPlayer.id, selectedPositions, type, value));
  };

  const handlePlayOrDiscard = (type: 'play' | 'discard') => {
    if (!selectedPlayer) return;
    const position = selectedPositions[0];
    if (selectedPlayer.isMe) {
      // My card has to be revealed first
      setReveal({ position, type });
      return;
    }
    run(() => (type === 'play' ? playCard : discardCard)(gameState, selectedPlayer.id, position));
  };

  const handleMove = (direction: 'left' | 'right') => {
    if (!selectedPlayer) return;
    const from = selectedPositions[0];
    const to = direction === 'left' ? from - 1 : from + 1;
    if (to < 0 || to >= selectedPlayer.hand.length) return;

    const hand = [...(selectedPlayer.hand as (Card | CardPossibilities)[])];
    [hand[from], hand[to]] = [hand[to], hand[from]];
    const reordered = selectedPlayer.isMe
      ? (hand as CardPossibilities[]).map((card, idx) => ({ ...card, position: idx }))
      : (hand as Card[]);

    onUpdateGame({
      ...gameState,
      players: players.map(p => (p.id === selectedPlayer.id ? { ...p, hand: reordered } : p)),
    });
  };

  const updateSetting = (key: keyof GameSettings, value: boolean) => {
    onUpdateGame({ ...gameState, settings: { ...settings, [key]: value } }, false);
  };

  const closeMenu = () => {
    setShowMenu(false);
    setConfirmingNewGame(false);
  };

  if (!me) {
    return <p className="p-6 text-ink-2">This saved game is missing your hand. Start a new game from the menu.</p>;
  }

  const lostToStrikes = gameState.strikeTokens === MAX_STRIKES;
  const perfect = gameState.score === MAX_SCORE;

  return (
    <div className="min-h-dvh bg-mat">
      <TableHeader
        hintTokens={gameState.hintTokens}
        strikeTokens={gameState.strikeTokens}
        deckCount={gameState.deckCount}
        canUndo={canUndo}
        onUndo={() => {
          setSelection(null);
          onUndo();
        }}
        onOpenMenu={() => setShowMenu(true)}
      />

      <main className={`mx-auto max-w-xl space-y-7 px-4 pt-5 ${activeSelection ? 'pb-72' : 'pb-16'}`}>
        {gameState.lastRoundStarted && !gameState.isGameOver && (
          <div role="status" className="flex items-center gap-3 rounded-xl border border-ink-3 bg-lacquer px-4 py-3">
            <Icon name="deck" size={18} className="shrink-0 text-ink" />
            <p className="text-sm">
              <span className="font-semibold">Final round.</span>{' '}
              <span className="text-ink-2">
                {gameState.finalTurnsLeft !== undefined
                  ? `The deck is empty: ${gameState.finalTurnsLeft} ${gameState.finalTurnsLeft === 1 ? 'turn' : 'turns'} left.`
                  : 'The deck is empty: everyone gets one more turn.'}
              </span>
            </p>
          </div>
        )}

        {notice && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-ink-3 bg-lacquer px-4 py-3 text-sm">
            <p className="flex-1">{notice}</p>
            <button onClick={() => setNotice(null)} aria-label="Dismiss" className="text-ink-2 hover:text-ink">
              <Icon name="close" size={16} />
            </button>
          </div>
        )}

        <FireworksRail fireworks={gameState.fireworks} score={gameState.score} />

        <PlayerHand
          player={me}
          gameState={gameState}
          handSize={handSize}
          selectedCardIds={selection?.playerId === me.id ? selection.cardIds : []}
          onToggleCard={cardId => toggleCard(me.id, cardId)}
          onOpenDeductions={() => setShowDeductions(true)}
        />

        {others.map(player => (
          <PlayerHand
            key={player.id}
            player={player}
            gameState={gameState}
            handSize={handSize}
            selectedCardIds={selection?.playerId === player.id ? selection.cardIds : []}
            onToggleCard={cardId => toggleCard(player.id, cardId)}
            onEditCards={() => setEditingPlayerId(player.id)}
          />
        ))}

        <DiscardPileDisplay discardPile={gameState.discardPile} />

        {!activeSelection && (
          <p className="text-center text-[13px] text-ink-3">
            Tap cards to give or record a clue, play, discard or move them.
          </p>
        )}
      </main>

      {activeSelection && selectedPlayer && (
        <ActionDock
          // A fresh dock per player so a half-picked clue never carries over
          key={selectedPlayer.id}
          player={selectedPlayer}
          selectedPositions={selectedPositions}
          hintTokens={gameState.hintTokens}
          focusMode={settings.focusMode}
          onClear={() => setSelection(null)}
          onSelectPositions={selectPositions}
          onGiveClue={handleClue}
          onPlay={() => handlePlayOrDiscard('play')}
          onDiscard={() => handlePlayOrDiscard('discard')}
          onMove={handleMove}
        />
      )}

      {reveal && (
        <RevealCardModal
          playerId={me.id}
          position={reveal.position}
          actionType={reveal.type}
          gameState={gameState}
          onClose={() => setReveal(null)}
          onUpdateGame={state => {
            onUpdateGame(state);
            setSelection(null);
          }}
        />
      )}

      {/* A drawn card for another player (skipped in Focus Mode) */}
      {gameState.pendingCardInput && !settings.focusMode && (
        <NewCardModal
          gameState={gameState}
          onUpdateGame={onUpdateGame}
          onUndo={canUndo ? onUndo : undefined}
          onSkip={() => onUpdateGame({ ...gameState, pendingCardInput: undefined }, false)}
        />
      )}

      {editingPlayerId && (
        <EditCardsModal
          gameState={gameState}
          playerId={editingPlayerId}
          onClose={() => setEditingPlayerId(null)}
          onUpdateGame={onUpdateGame}
        />
      )}

      {showDeductions && (
        <DeductionModal gameState={gameState} onClose={() => setShowDeductions(false)} onUpdateGame={onUpdateGame} />
      )}

      {showMenu && (
        <Sheet title="Game" onClose={closeMenu}>
          <div className="divide-y divide-rule">
            <SwitchRow
              label="Highlight safe plays"
              description="Marks cards you know will play."
              checked={settings.showSafeToPlay}
              onChange={v => updateSetting('showSafeToPlay', v)}
            />
            <SwitchRow
              label="Highlight safe discards"
              description="Marks cards that can never be played: already on the fireworks, or every lower copy is gone."
              checked={settings.showSafeToDiscard}
              onChange={v => updateSetting('showSafeToDiscard', v)}
            />
            <SwitchRow
              label="Apply deductions to my cards"
              description="Uses the options you've ruled out under Deductions."
              checked={settings.showDeductions}
              onChange={v => updateSetting('showDeductions', v)}
            />
            <SwitchRow
              label="Focus mode"
              description="Track only your own hand: no token limits, strikes or end-of-game, and no prompts to enter cards."
              checked={settings.focusMode}
              onChange={v => updateSetting('focusMode', v)}
            />
          </div>

          <div className="mt-4 border-t border-rule pt-4">
            {confirmingNewGame ? (
              <div className="space-y-3">
                <p className="text-sm text-ink-2">End this game and start over? This can&apos;t be undone.</p>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => setConfirmingNewGame(false)}>
                    Keep playing
                  </Button>
                  <Button variant="danger" className="flex-1" onClick={onNewGame}>
                    End game
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" className="w-full" onClick={() => setConfirmingNewGame(true)}>
                New game
              </Button>
            )}
          </div>
        </Sheet>
      )}

      {gameState.isGameOver && (
        <Sheet
          title={lostToStrikes ? 'The fuse burned out' : perfect ? 'A perfect show' : 'The show is over'}
          description={
            lostToStrikes
              ? 'Three strikes end the game.'
              : perfect
              ? 'Every firework, all the way to 5.'
              : 'The deck ran out and everyone took their last turn.'
          }
          onClose={() => onUpdateGame({ ...gameState, isGameOver: false }, false)}
          footer={
            <>
              {canUndo && (
                <Button icon="undo" className="flex-1" onClick={onUndo}>
                  Undo
                </Button>
              )}
              <Button variant="primary" className="flex-1" onClick={onNewGame}>
                New game
              </Button>
            </>
          }
        >
          <div className="flex flex-col items-center pb-4">
            {/* The finished fireworks, top card of each, fanned like a hand.
                Clipped sideways at the sheet's edges so the burst rings can't make it scroll. */}
            <ol aria-label="Final fireworks" className="-mx-5 flex h-36 items-end justify-center self-stretch overflow-x-clip px-5">
              {COLORS.map((color, i) => {
                const level = gameState.fireworks[color];
                const angle = (i - (COLORS.length - 1) / 2) * FAN_STEP;
                return (
                  <li
                    key={color}
                    className="relative -mx-2 w-16 origin-bottom sm:w-[72px]"
                    style={{ transform: `rotate(${angle}deg) translateY(${Math.abs(angle) * 0.5}px)` }}
                  >
                    {level > 0 ? (
                      <CardFace color={color} number={level as CardNumber} />
                    ) : (
                      <>
                        {/* Filled so the neighbouring card doesn't show through the outline */}
                        <EmptySlot color={color} className="bg-lacquer" />
                        <span className="sr-only">{SUIT_NAMES[color]}: none played</span>
                      </>
                    )}
                    {perfect && justEnded && (
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-0 rounded-full border-4 border-current ${SUIT_TEXT[color]} animate-burst motion-reduce:hidden`}
                        // Hold the start frame through the stagger so no ring shows before its turn
                        style={{ animationDelay: `${i * 120}ms`, animationFillMode: 'both' }}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
            <p className="mt-5 flex items-baseline gap-1.5">
              <span className="text-[40px] leading-none font-extrabold [font-stretch:80%]">{gameState.score}</span>
              <span className="text-sm font-medium text-ink-2">of {MAX_SCORE}</span>
            </p>
            <button
              onClick={() => onUpdateGame({ ...gameState, isGameOver: false }, false)}
              className="mt-4 text-sm font-semibold text-ink-2 underline underline-offset-4 hover:text-ink"
            >
              Review the table
            </button>
          </div>
        </Sheet>
      )}
    </div>
  );
}
