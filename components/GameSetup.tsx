'use client';

import { useState } from 'react';
import { GameSetup as GameSetupType } from '@/types/game';

interface GameSetupProps {
  onStartGame: (setup: GameSetupType) => void;
}

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4 | 5>(4);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(0);

  const handlePlayerCountChange = (count: 2 | 3 | 4 | 5) => {
    setPlayerCount(count);
    const newNames = Array(count).fill('').map((_, i) =>
      i < playerNames.length ? playerNames[i] : ''
    );
    setPlayerNames(newNames);
    if (myPlayerIndex >= count) {
      setMyPlayerIndex(0);
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    // Validate: all names filled
    const allNamesFilled = playerNames.every(name => name.trim().length > 0);
    if (!allNamesFilled) {
      alert('Please enter names for all players');
      return;
    }

    onStartGame({
      playerCount,
      playerNames: playerNames.map(n => n.trim()),
      myPlayerIndex,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">🎆 Hanabi Digital</h1>
          <p className="text-white/80 text-sm">Create the perfect fireworks show</p>
        </div>

        {/* Player Count Selector */}
        <div className="space-y-3">
          <label className="text-white font-semibold text-sm">Number of Players</label>
          <div className="grid grid-cols-4 gap-2">
            {[2, 3, 4, 5].map((count) => (
              <button
                key={count}
                onClick={() => handlePlayerCountChange(count as 2 | 3 | 4 | 5)}
                className={`py-3 rounded-xl font-bold text-lg transition-all ${
                  playerCount === count
                    ? 'bg-white text-purple-900 shadow-lg scale-105'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        {/* Player Names */}
        <div className="space-y-3">
          <label className="text-white font-semibold text-sm">Player Names</label>
          <div className="space-y-2">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white placeholder-white/50 border-2 border-white/20 focus:border-white/50 focus:outline-none transition-all"
                  maxLength={20}
                />
                <button
                  onClick={() => setMyPlayerIndex(index)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    myPlayerIndex === index
                      ? 'bg-green-500 text-white shadow-lg'
                      : 'bg-white/20 text-white/70 hover:bg-white/30'
                  }`}
                >
                  {myPlayerIndex === index ? '✓ Me' : 'Me'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-white/60 text-xs">Select which player is you</p>
        </div>

        {/* Start Game Button */}
        <button
          onClick={handleStartGame}
          className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          Start Game 🚀
        </button>

        {/* Info */}
        <div className="bg-white/5 rounded-xl p-4 space-y-2">
          <h3 className="text-white font-semibold text-sm">How to play:</h3>
          <ul className="text-white/70 text-xs space-y-1 list-disc list-inside">
            <li>You cannot see your own cards</li>
            <li>Give clues about colors or numbers</li>
            <li>Build fireworks from 1 to 5</li>
            <li>Work together to get the highest score!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
