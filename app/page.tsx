'use client';

import { useState, useEffect } from 'react';
import GameSetup from '@/components/GameSetup';
import GameView from '@/components/GameView';
import CardInputScreen from '@/components/CardInputScreen';
import { GameState, GameSetup as GameSetupType } from '@/types/game';
import { initializeGame, updateGameScore } from '@/utils/gameInit';
import { loadGameState, saveGameState, clearGameState, cloneGameState } from '@/utils/storage';

const MAX_UNDO_STACK_SIZE = 20;

export default function Home() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [undoStack, setUndoStack] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load game state from localStorage on mount
  useEffect(() => {
    setGameState(loadGameState());
    setIsLoading(false);
  }, []);

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
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
        // Deep copy to prevent mutation corruption
        const newStack = [...prev, cloneGameState(gameState)];
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
      // Undo steps back game actions; settings are preferences, so the current ones stay
      setGameState(gameState ? { ...previousState, settings: gameState.settings } : previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const handleNewGame = () => {
    clearGameState();
    setGameState(null);
    setUndoStack([]);
  };

  if (isLoading) {
    // Brief blank frame while the saved game is read; matches the table so nothing flashes
    return <div className="min-h-dvh bg-mat" aria-busy="true" />;
  }

  if (!gameState) {
    return <GameSetup onStartGame={handleStartGame} />;
  }

  // Show card input screen if needed (skip in Focus Mode)
  if (gameState.needsCardInput && !gameState.settings.focusMode) {
    return <CardInputScreen gameState={gameState} onComplete={handleUpdateGame} />;
  }

  return (
    <GameView
      gameState={gameState}
      onUpdateGame={handleUpdateGame}
      onUndo={handleUndo}
      canUndo={undoStack.length > 0}
      onNewGame={handleNewGame}
    />
  );
}
