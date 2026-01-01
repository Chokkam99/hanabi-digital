'use client';

import { useState, useEffect } from 'react';
import GameSetup from '@/components/GameSetup';
import GameView from '@/components/GameView';
import CardInputScreen from '@/components/CardInputScreen';
import { GameState, GameSetup as GameSetupType } from '@/types/game';
import { initializeGame, updateGameScore } from '@/utils/gameInit';

const STORAGE_KEY = 'hanabi-game-state';

const MAX_UNDO_STACK_SIZE = 20;

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Validate required fields exist
        if (!parsed.gameId || !parsed.players || !Array.isArray(parsed.players)) {
          throw new Error('Invalid game state structure');
        }
        // Reconstruct Sets for card possibilities
        const reconstructed = reconstructGameState(parsed);
        setGameState(reconstructed);
      } catch (error) {
        console.error('Failed to load saved game:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState) {
      // Convert Sets to Arrays for JSON serialization
      const serializable = serializeGameState(gameState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    }
  }, [gameState]);

  const handleStartGame = (setup: GameSetupType) => {
    const newGame = initializeGame(setup);
    setGameState(newGame);
    setUndoStack([]);
  };

  const handleUpdateGame = (newState: GameState, saveToHistory: boolean = true) => {
    // Only save to history for actual game actions (not navigation/settings)
    if (gameState && saveToHistory) {
      setUndoStack(prev => {
        // Deep copy via serialization to prevent mutation corruption
        const serialized = serializeGameState(gameState);
        const deepCopy = reconstructGameState(serialized);
        const newStack = [...prev, deepCopy];
        // Limit stack size to prevent memory issues
        if (newStack.length > MAX_UNDO_STACK_SIZE) {
          return newStack.slice(-MAX_UNDO_STACK_SIZE);
        }
        return newStack;
      });
    }
    const updatedState = updateGameScore(newState);
    setGameState(updatedState);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1];
      setGameState(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const handleNewGame = () => {
    localStorage.removeItem(STORAGE_KEY);
    setGameState(null);
    setUndoStack([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!gameState) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  // Show card input screen if needed (skip in Focus Mode)
  if (gameState.needsCardInput && !gameState.settings.focusMode) {
    return <CardInputScreen gameState={gameState} onComplete={handleUpdateGame} />;
  }

  return (
    <>
      <GameView
        gameState={gameState}
        onUpdateGame={handleUpdateGame}
        onUndo={handleUndo}
        canUndo={undoStack.length > 0}
      />

      {/* New Game Button (Fixed at bottom) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
        <button
          onClick={handleNewGame}
          className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full shadow-lg active:scale-95 transition-all"
        >
          🔄 New Game
        </button>
      </div>
    </>
  );
}

// Helper to serialize game state for localStorage
function serializeGameState(state: GameState): any {
  return {
    ...state,
    players: state.players.map(player => ({
      ...player,
      hand: player.hand.map((card: any) => {
        if ('possibleColors' in card) {
          return {
            ...card,
            possibleColors: Array.from(card.possibleColors),
            possibleNumbers: Array.from(card.possibleNumbers),
            manualExclusions: card.manualExclusions ? {
              colors: Array.from(card.manualExclusions.colors),
              numbers: Array.from(card.manualExclusions.numbers),
            } : undefined,
          };
        }
        return card;
      }),
    })),
  };
}

// Helper to reconstruct Sets from stored arrays
function reconstructGameState(stored: any): GameState {
  return {
    ...stored,
    players: stored.players.map((player: any) => ({
      ...player,
      hand: player.hand.map((card: any) => {
        if (Array.isArray(card.possibleColors)) {
          return {
            ...card,
            possibleColors: new Set(card.possibleColors),
            possibleNumbers: new Set(card.possibleNumbers),
            manualExclusions: card.manualExclusions ? {
              colors: new Set(card.manualExclusions.colors),
              numbers: new Set(card.manualExclusions.numbers),
            } : undefined,
          };
        }
        return card;
      }),
    })),
  };
}
