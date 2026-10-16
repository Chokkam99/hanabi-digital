'use client';

import { useEffect, useRef, useState } from 'react';
import { Fireworks, Color, COLORS, MAX_SCORE, CardNumber } from '@/types/game';
import { CardFace, EmptySlot } from './Card';
import { SUIT_TEXT } from './SuitEmblem';

interface FireworksRailProps {
  fireworks: Fireworks;
  score: number;
}

export default function FireworksRail({ fireworks, score }: FireworksRailProps) {
  // A newly played card lands with a flip; a firework reaching 5 also throws a ring of light.
  // Only on change, never on load.
  const previous = useRef(fireworks);
  const [justPlayed, setJustPlayed] = useState<Color | null>(null);
  const [bursting, setBursting] = useState<Color | null>(null);

  useEffect(() => {
    const played = COLORS.find(c => fireworks[c] === previous.current[c] + 1);
    previous.current = fireworks;
    if (!played) return;

    setJustPlayed(played);
    if (fireworks[played] === 5) setBursting(played);
    const timer = setTimeout(() => setBursting(null), 1000);
    return () => clearTimeout(timer);
  }, [fireworks]);

  return (
    <section aria-labelledby="fireworks-heading" className="flex items-end gap-4">
      <h2 id="fireworks-heading" className="sr-only">Fireworks</h2>
      {/* One stack per suit; the score sits right beside them */}
      <ol
        className="grid w-full max-w-76 gap-2"
        style={{ gridTemplateColumns: `repeat(${COLORS.length}, minmax(0, 1fr))` }}
      >
        {COLORS.map(color => {
          const level = fireworks[color];
          return (
            <li key={color} className="relative">
              {level > 0 ? (
                <CardFace
                  key={level}
                  color={color}
                  number={level as CardNumber}
                  className={justPlayed === color ? 'animate-flip-in' : ''}
                />
              ) : (
                <EmptySlot color={color} />
              )}
              {bursting === color && (
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 rounded-full border-4 border-current ${SUIT_TEXT[color]} animate-burst`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <div className="shrink-0 pb-0.5 text-right">
        <div className="text-[40px] leading-none font-extrabold [font-stretch:80%]">{score}</div>
        <div className="mt-1 text-xs font-medium text-ink-2">of {MAX_SCORE}</div>
      </div>
    </section>
  );
}
