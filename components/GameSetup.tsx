'use client';

import { useState } from 'react';
import { GameSetup as GameSetupType, COLORS, CardNumber } from '@/types/game';
import { CardFace } from './Card';
import Button from './ui/Button';

interface GameSetupProps {
  onStartGame: (setup: GameSetupType) => void;
}

type PlayerCount = 2 | 3 | 4 | 5;
const PLAYER_COUNTS: PlayerCount[] = [2, 3, 4, 5];
const FAN_ANGLES = [-16, -8, 0, 8, 16];

export default function GameSetup({ onStartGame }: GameSetupProps) {
  const [playerCount, setPlayerCount] = useState<PlayerCount>(4);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '', '']);
  const [myPlayerIndex, setMyPlayerIndex] = useState<number>(0);

  const handlePlayerCountChange = (count: PlayerCount) => {
    setPlayerCount(count);
    setPlayerNames(Array.from({ length: count }, (_, i) => playerNames[i] ?? ''));
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
    onStartGame({
      playerCount,
      // Blank names fall back to their seat, so a game can start in one tap
      playerNames: playerNames.map((n, i) => n.trim() || `Player ${i + 1}`),
      myPlayerIndex,
    });
  };

  return (
    <main className="min-h-dvh bg-mat px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-safe">
      <div className="mx-auto max-w-md">
        {/* The five suits, fanned like a hand */}
        <div className="flex h-36 items-end justify-center" aria-hidden="true">
          {COLORS.map((color, i) => (
            <div
              key={color}
              className="-mx-2 w-16 origin-bottom"
              style={{ transform: `rotate(${FAN_ANGLES[i]}deg) translateY(${Math.abs(FAN_ANGLES[i]) * 0.5}px)` }}
            >
              <CardFace color={color} number={(i + 1) as CardNumber} />
            </div>
          ))}
        </div>

        <h1 className="mt-8 text-center text-[34px] leading-none font-bold tracking-tight [font-stretch:112%]">
          Hanabi Digital
        </h1>
        <p className="mx-auto mt-3 max-w-[30ch] text-center text-[15px] text-ink-2">
          Keeps every clue straight at the table, so you can keep your eyes on the cards.
        </p>

        <div className="mt-10 space-y-8">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink">Players</legend>
            <div role="radiogroup" aria-label="Number of players" className="grid grid-cols-4 gap-1 rounded-2xl bg-lacquer p-1">
              {PLAYER_COUNTS.map(count => (
                <button
                  key={count}
                  role="radio"
                  aria-checked={playerCount === count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`h-12 rounded-xl text-xl font-extrabold transition-colors duration-150 [font-stretch:80%] ${
                    playerCount === count ? 'bg-ink text-mat' : 'text-ink-2 hover:bg-lacquer-2 hover:text-ink'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1 text-sm font-semibold text-ink">Names, in turn order</legend>
            <p className="mb-3 text-[13px] text-ink-2">Mark which one is you.</p>
            <ol className="space-y-2">
              {playerNames.map((name, index) => {
                const isMe = myPlayerIndex === index;
                return (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-center text-sm font-semibold text-ink-3">{index + 1}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={e => handleNameChange(index, e.target.value)}
                      placeholder={`Player ${index + 1}`}
                      aria-label={`Player ${index + 1} name`}
                      maxLength={20}
                      autoComplete="off"
                      className="h-12 min-w-0 flex-1 rounded-xl border border-rule bg-lacquer px-4 text-[16px] text-ink placeholder:text-ink-2/70 focus:border-ink-2 focus:outline-none"
                    />
                    <button
                      role="radio"
                      aria-checked={isMe}
                      aria-label={`Player ${index + 1} is me`}
                      onClick={() => setMyPlayerIndex(index)}
                      className={`h-12 w-16 shrink-0 rounded-xl text-sm font-semibold transition-colors duration-150 ${
                        isMe ? 'bg-ink text-mat' : 'border border-rule text-ink-3 hover:text-ink'
                      }`}
                    >
                      You
                    </button>
                  </li>
                );
              })}
            </ol>
          </fieldset>

          <Button variant="primary" size="lg" className="w-full" onClick={handleStartGame}>
            Deal the cards
          </Button>
          <p className="pb-6 text-center text-[13px] text-ink-3">The game is saved on this phone as you play.</p>
        </div>
      </div>
    </main>
  );
}
