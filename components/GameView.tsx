'use client';

import { useState } from 'react';
import { GameState, Player, CardPossibilities, Card } from '@/types/game';
import PlayerHand from './PlayerHand';
import TokenDisplay from './TokenDisplay';
import FireworksDisplay from './FireworksDisplay';
import DiscardPileDisplay from './DiscardPileDisplay';
import NewCardModal from './NewCardModal';
import EditCardsModal from './EditCardsModal';

interface GameViewProps {
  gameState: GameState;
  onUpdateGame: (newState: GameState, saveToHistory?: boolean) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export default function GameView({ gameState, onUpdateGame, onUndo, canUndo }: GameViewProps) {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showDiscards, setShowDiscards] = useState(false);
  const [showOtherPlayerKnowledge, setShowOtherPlayerKnowledge] = useState(false);
  const [editingPlayerCards, setEditingPlayerCards] = useState(false);

  const currentViewPlayer = gameState.players.find(
    p => p.id === gameState.currentViewPlayerId
  );

  const myPlayer = gameState.players.find(p => p.id === gameState.myPlayerId);

  const isViewingMyHand = gameState.currentViewPlayerId === gameState.myPlayerId;

  const handlePlayerSwitch = (playerId: string) => {
    onUpdateGame({
      ...gameState,
      currentViewPlayerId: playerId,
    }, false); // Don't save navigation to history
  };

  if (!currentViewPlayer || !myPlayer) {
    return <div>Error: Player not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex flex-col">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="text-xl font-bold text-white">🎆 Hanabi</h1>
        <div className="flex items-center gap-3">
          {canUndo && (
            <button
              onClick={onUndo}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
            >
              ↶ Undo
            </button>
          )}
          <TokenDisplay
            hintTokens={gameState.hintTokens}
            strikeTokens={gameState.strikeTokens}
          />
        </div>
      </header>

      {/* Last Round Warning */}
      {gameState.lastRoundStarted && !gameState.isGameOver && (
        <div className="bg-amber-500 text-black px-4 py-2 text-center font-semibold text-sm">
          ⏰ Last Round! Deck is empty - finish remaining turns
        </div>
      )}

      {/* Player Selector */}
      <div className="px-4 py-3 bg-white/5">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {gameState.players.map((player) => (
            <button
              key={player.id}
              onClick={() => handlePlayerSwitch(player.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                player.id === gameState.currentViewPlayerId
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {player.isMe ? '👤 ' : ''}
              {player.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {/* View Toggle for Other Players */}
        {!isViewingMyHand && (
          <div className="space-y-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center justify-between">
              <span className="text-white text-sm font-medium">
                Show what {currentViewPlayer.name} knows
              </span>
              <button
                onClick={() => setShowOtherPlayerKnowledge(!showOtherPlayerKnowledge)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  showOtherPlayerKnowledge
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white'
                }`}
              >
                {showOtherPlayerKnowledge ? 'ON' : 'OFF'}
              </button>
            </div>

            <button
              onClick={() => setEditingPlayerCards(true)}
              className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-3 text-white text-sm font-medium hover:bg-white/15 transition-all active:scale-98"
            >
              ✏️ Edit {currentViewPlayer.name}'s Cards
            </button>
          </div>
        )}

        {/* Player Hand */}
        <PlayerHand
          player={currentViewPlayer}
          isMyHand={isViewingMyHand}
          showKnowledge={isViewingMyHand || showOtherPlayerKnowledge}
          gameState={gameState}
          onUpdateGame={onUpdateGame}
        />

        {/* Fireworks Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
          <button
            onClick={() => setShowFireworks(!showFireworks)}
            className="w-full px-4 py-3 flex items-center justify-between text-white font-semibold hover:bg-white/5 transition-colors"
          >
            <span>🎆 Fireworks ({gameState.score}/25)</span>
            <span className="text-xl">{showFireworks ? '▼' : '▶'}</span>
          </button>
          {showFireworks && (
            <div className="px-4 pb-4">
              <FireworksDisplay fireworks={gameState.fireworks} />
            </div>
          )}
        </div>

        {/* Discard Pile Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
          <button
            onClick={() => setShowDiscards(!showDiscards)}
            className="w-full px-4 py-3 flex items-center justify-between text-white font-semibold hover:bg-white/5 transition-colors"
          >
            <span>🗑️ Discards ({gameState.discardPile.length})</span>
            <span className="text-xl">{showDiscards ? '▼' : '▶'}</span>
          </button>
          {showDiscards && (
            <div className="px-4 pb-4">
              <DiscardPileDisplay discardPile={gameState.discardPile} />
            </div>
          )}
        </div>

        {/* Settings Toggle */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
          <h3 className="text-white font-semibold text-sm">Settings</h3>
          <div className="space-y-2">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-white text-sm font-medium">Focus Mode</div>
                <div className="text-white/60 text-xs">Don't enforce game rules (tokens/strikes)</div>
              </div>
              <input
                type="checkbox"
                checked={gameState.settings.focusMode}
                onChange={(e) => {
                  onUpdateGame({
                    ...gameState,
                    settings: {
                      ...gameState.settings,
                      focusMode: e.target.checked,
                    },
                  }, false);
                }}
                className="w-5 h-5 rounded accent-purple-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-white text-sm">Show safe to play</span>
              <input
                type="checkbox"
                checked={gameState.settings.showSafeToPlay}
                onChange={(e) =>
                  onUpdateGame({
                    ...gameState,
                    settings: {
                      ...gameState.settings,
                      showSafeToPlay: e.target.checked,
                    },
                  }, false) // Don't save settings changes to history
                }
                className="w-5 h-5 rounded accent-green-500"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-white text-sm">Show safe to discard</span>
              <input
                type="checkbox"
                checked={gameState.settings.showSafeToDiscard}
                onChange={(e) =>
                  onUpdateGame({
                    ...gameState,
                    settings: {
                      ...gameState.settings,
                      showSafeToDiscard: e.target.checked,
                    },
                  }, false) // Don't save settings changes to history
                }
                className="w-5 h-5 rounded accent-yellow-500"
              />
            </label>
          </div>
        </div>
      </div>


      {/* New Card Modal - appears automatically when needed (skip in Focus Mode) */}
      {gameState.pendingCardInput && !gameState.settings.focusMode && (
        <NewCardModal
          gameState={gameState}
          onClose={() => {}}
          onUpdateGame={onUpdateGame}
        />
      )}

      {/* Edit Cards Modal */}
      {editingPlayerCards && (
        <EditCardsModal
          gameState={gameState}
          playerId={gameState.currentViewPlayerId}
          onClose={() => setEditingPlayerCards(false)}
          onUpdateGame={onUpdateGame}
        />
      )}

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 max-w-md w-full shadow-2xl relative">
            {/* Close button */}
            <button
              onClick={() => onUpdateGame({ ...gameState, isGameOver: false }, false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold transition-all"
            >
              ×
            </button>

            <div className="text-center space-y-4">
              {/* Game Over Icon */}
              <div className="text-6xl mb-2">
                {gameState.strikeTokens === 3 ? '💥' : gameState.score === 25 ? '🎉' : '🎆'}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-white">
                {gameState.strikeTokens === 3 ? 'Game Over!' : gameState.score === 25 ? 'Perfect Score!' : 'Game Complete!'}
              </h2>

              {/* Reason */}
              <p className="text-white/80 text-lg">
                {gameState.strikeTokens === 3
                  ? 'Three strikes - the fireworks show has ended early'
                  : gameState.score === 25
                  ? 'You achieved a legendary perfect score of 25!'
                  : 'The deck is empty and all turns are complete'}
              </p>

              {/* Final Score */}
              <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-white/70 text-sm mb-1">Final Score</div>
                <div className="text-5xl font-bold text-white">{gameState.score}/25</div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {canUndo && (
                  <button
                    onClick={() => {
                      onUndo();
                    }}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all shadow-lg"
                  >
                    ↶ Undo Last Action
                  </button>
                )}

                <button
                  onClick={() => onUpdateGame({ ...gameState, isGameOver: false }, false)}
                  className="w-full py-3 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-xl transition-all"
                >
                  Review Game
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  Start New Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
