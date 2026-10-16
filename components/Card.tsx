'use client';

import { useEffect, useRef, useState } from 'react';
import { Color, CardNumber, COLORS, NUMBERS } from '@/types/game';
import SuitEmblem, { SUIT_BG, SUIT_NAMES, SUIT_ON, SUIT_TEXT } from './SuitEmblem';

// Cards are 3:5 slabs that size to their container; type and crests scale with the card (cqw).
// A dark keyline, a pale rim where the stock meets the table, and a top highlight make them read as printed card.
const SLAB = '@container relative aspect-[3/5] w-full overflow-hidden rounded-[10%/6%] border-[1.5px] border-keyline';
const STOCK = 'shadow-[0_0_0_1px_rgba(255,255,255,0.16),inset_0_1px_0_rgba(255,255,255,0.22),0_3px_8px_rgba(0,0,0,0.55)]';

interface CardFaceProps {
  color: Color;
  number: CardNumber;
  className?: string;
}

/**
 * A known card, printed like a hanafuda face: suit field, numeral, crest
 */
export function CardFace({ color, number, className = '' }: CardFaceProps) {
  return (
    <div
      role="img"
      aria-label={`${SUIT_NAMES[color]} ${number}`}
      className={`${SLAB} ${SUIT_BG[color]} ${SUIT_ON[color]} ${STOCK} ${className}`}
    >
      <span className="absolute top-[4%] left-[10%] text-[40cqw] leading-none font-extrabold [font-stretch:75%]">
        {number}
      </span>
      <SuitEmblem color={color} className="absolute bottom-[12%] left-1/2 size-[56cqw] -translate-x-1/2" />
    </div>
  );
}

interface CardBackProps {
  possibleColors: Set<Color>;
  possibleNumbers: Set<CardNumber>;
  className?: string;
}

/**
 * A crest on a card back: in its suit color while possible; gray and struck through once ruled out
 */
function OptionCrest({ color, possible, className }: { color: Color; possible: boolean; className: string }) {
  return (
    <span className={`relative inline-flex ${possible ? SUIT_TEXT[color] : 'text-ink-3'}`}>
      <SuitEmblem color={color} className={className} />
      {!possible && (
        <span aria-hidden="true" className="absolute top-1/2 -right-[15%] -left-[15%] h-[1.5px] -rotate-45 bg-current" />
      )}
    </span>
  );
}

function describePossibilities(colors: Set<Color>, numbers: Set<CardNumber>): string {
  const colorText = colors.size === 1 ? SUIT_NAMES[[...colors][0]] : `${[...colors].map(c => SUIT_NAMES[c]).join(', ')}`;
  const numberText = numbers.size === 1 ? `${[...numbers][0]}` : [...numbers].join(', ');
  return `Unknown card. Could be ${colorText}; ${numberText}`;
}

/**
 * A card whose face isn't known yet. It develops as clues land:
 * the back carries every option, ruled-out ones faded; a known color floods the field,
 * a known number prints large
 */
export function CardBack({ possibleColors, possibleNumbers, className = '' }: CardBackProps) {
  const knownColor = possibleColors.size === 1 ? [...possibleColors][0] : null;
  const knownNumber = possibleNumbers.size === 1 ? [...possibleNumbers][0] : null;
  const label = describePossibilities(possibleColors, possibleNumbers);

  // Color known: the suit floods the card, numbers still open along the bottom
  if (knownColor) {
    return (
      <div role="img" aria-label={label} className={`${SLAB} ${SUIT_BG[knownColor]} ${SUIT_ON[knownColor]} ${STOCK} ${className}`}>
        <SuitEmblem color={knownColor} className="absolute top-[12%] left-1/2 size-[50cqw] -translate-x-1/2" />
        <div className="absolute inset-x-[8%] bottom-[7%] flex justify-between text-[17cqw] leading-none font-extrabold [font-stretch:75%]">
          {NUMBERS.map(n => (
            <span key={n} className={possibleNumbers.has(n) ? '' : 'opacity-55 line-through decoration-2'}>
              {n}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div role="img" aria-label={label} className={`${SLAB} bg-card-back ${STOCK} ${className}`}>
      {/* Double-ruled frame printed in ink tone, as on a card back; never a hue, so it can't read as a suit */}
      <div className="absolute inset-[5%] rounded-[8%/5%] border border-ink/25" />
      <div className="absolute inset-[9%] rounded-[6%/4%] border border-ink/10" />

      {knownNumber ? (
        // Number known: printed large, colors still open along the bottom
        <>
          <span className="absolute inset-x-0 top-[12%] text-center text-[46cqw] leading-none font-extrabold text-ink [font-stretch:75%]">
            {knownNumber}
          </span>
          <div className="absolute inset-x-[14%] bottom-[14%] flex justify-between">
            {COLORS.map(c => (
              <OptionCrest key={c} color={c} possible={possibleColors.has(c)} className="size-[13cqw]" />
            ))}
          </div>
        </>
      ) : (
        // Nothing pinned down: every crest and number, ruled-out ones struck
        <div
          className="absolute inset-[14%] grid grid-cols-2 place-items-center"
          // Rows follow the suit and number lists, so a variant suit adds a row
          style={{ gridTemplateRows: `repeat(${Math.max(COLORS.length, NUMBERS.length)}, minmax(0, 1fr))` }}
        >
          {/* Explicit placement keeps crests in the left column, numbers in the right */}
          {COLORS.map((c, i) => (
            <span key={c} style={{ gridColumn: 1, gridRow: i + 1 }} className="flex">
              <OptionCrest color={c} possible={possibleColors.has(c)} className="size-[16cqw]" />
            </span>
          ))}
          {NUMBERS.map((n, i) => (
            <span
              key={n}
              style={{ gridColumn: 2, gridRow: i + 1 }}
              className={`text-[18cqw] leading-none font-bold [font-stretch:80%] ${
                possibleNumbers.has(n) ? 'text-ink' : 'text-ink-3 line-through decoration-[1.5px]'
              }`}
            >
              {n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface KnowledgeCardProps {
  possibleColors: Set<Color>;
  possibleNumbers: Set<CardNumber>;
}

/**
 * Shows what's known about a card, turning face-up (with a flip) once it's fully known
 */
export function KnowledgeCard({ possibleColors, possibleNumbers }: KnowledgeCardProps) {
  const isKnown = possibleColors.size === 1 && possibleNumbers.size === 1;
  const wasKnown = useRef(isKnown);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (isKnown && !wasKnown.current) {
      setFlipping(true);
    }
    wasKnown.current = isKnown;
  }, [isKnown]);

  if (isKnown) {
    return (
      <CardFace
        color={[...possibleColors][0]}
        number={[...possibleNumbers][0]}
        className={flipping ? 'animate-flip-in' : ''}
      />
    );
  }

  return <CardBack possibleColors={possibleColors} possibleNumbers={possibleNumbers} />;
}

interface EmptySlotProps {
  label?: string;
  color?: Color;
  className?: string;
}

/**
 * An outline where a card belongs: a hand slot not entered yet, or an empty firework
 */
export function EmptySlot({ label, color, className = '' }: EmptySlotProps) {
  return (
    <div
      className={`@container relative flex aspect-[3/5] w-full items-center justify-center rounded-[10%/6%] border-[1.5px] border-dashed ${
        color ? `${SUIT_TEXT[color]} border-current/45` : 'border-rule text-ink-3'
      } ${className}`}
    >
      {color ? (
        <SuitEmblem color={color} className="size-[46cqw] opacity-35" />
      ) : (
        label && <span className="px-1 text-center text-[15cqw] leading-tight font-medium">{label}</span>
      )}
    </div>
  );
}
