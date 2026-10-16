import { useId } from 'react';
import { Color } from '@/types/game';

// Each suit is a crest as well as a color, so suits stay distinct for color-blind players:
// red plum, yellow chrysanthemum, green pine, blue wave, white moon
export const SUIT_NAMES: Record<Color, string> = {
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Blue',
  white: 'White',
};

// Tailwind classes per suit, kept as literals so the class scanner finds them
export const SUIT_TEXT: Record<Color, string> = {
  red: 'text-suit-red',
  yellow: 'text-suit-yellow',
  green: 'text-suit-green',
  blue: 'text-suit-blue',
  white: 'text-suit-white',
};

export const SUIT_BG: Record<Color, string> = {
  red: 'bg-suit-red',
  yellow: 'bg-suit-yellow',
  green: 'bg-suit-green',
  blue: 'bg-suit-blue',
  white: 'bg-suit-white',
};

export const SUIT_BORDER: Record<Color, string> = {
  red: 'border-suit-red',
  yellow: 'border-suit-yellow',
  green: 'border-suit-green',
  blue: 'border-suit-blue',
  white: 'border-suit-white',
};

// Ink printed on top of a suit-colored card face
export const SUIT_ON: Record<Color, string> = {
  red: 'text-ink',
  yellow: 'text-keyline',
  green: 'text-ink',
  blue: 'text-ink',
  white: 'text-keyline',
};

const PLUM_PETALS = Array.from({ length: 5 }, (_, i) => {
  const angle = ((-90 + i * 72) * Math.PI) / 180;
  return { cx: 12 + 5.6 * Math.cos(angle), cy: 12.4 + 5.6 * Math.sin(angle) };
});

// One kiku petal pointing up: narrow at the disc, a round tip at the rim. Sixteen of them,
// with an even hairline between neighbours, make the scalloped edge of a kiku mon.
const KIKU_PETAL = 'M11.61 8.25L10.53 2.8A1.5 1.5 0 1 1 13.47 2.8L12.39 8.25A3.77 3.77 0 0 0 11.61 8.25Z';

// Matsu tiers: each is a flat fan of needles with a drooping underside,
// topped by a row of round clumps so it reads as a needle cloud
const PINE_TIERS = [
  {
    fan: 'M7.4 7.2A4.6 3.2 0 0 1 16.6 7.2Q12 5.86 7.4 7.2Z',
    clumps: [[9.05, 5.57], [12, 4.83], [14.95, 5.57]],
    r: 1.5,
  },
  {
    fan: 'M4.2 13A7.8 3.8 0 0 1 19.8 13Q12 11.4 4.2 13Z',
    clumps: [[6.07, 11.47], [10.02, 10.26], [13.98, 10.26], [17.93, 11.47]],
    r: 1.7,
  },
  {
    fan: 'M1.2 18.8A10.8 4.4 0 0 1 22.8 18.8Q12 16.95 1.2 18.8Z',
    clumps: [[3.29, 17.24], [7.64, 15.82], [12, 15.45], [16.36, 15.82], [20.71, 17.24]],
    r: 1.9,
  },
];

function Crest({ color }: { color: Color }) {
  // Masks need ids unique to this instance
  const maskId = useId();

  switch (color) {
    case 'red':
      // Plum blossom: five round petals around a pierced center
      return (
        <>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <circle cx="12" cy="12.4" r="2.2" fill="black" />
          </mask>
          <g mask={`url(#${maskId})`}>
            {PLUM_PETALS.map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="4.4" />
            ))}
            <circle cx="12" cy="12.4" r="4" />
          </g>
        </>
      );
    case 'yellow':
      // Chrysanthemum (kiku mon): sixteen round-tipped petals around a disc
      return (
        <>
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={KIKU_PETAL} transform={`rotate(${i * 22.5} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="3" />
        </>
      );
    case 'green':
      // Pine (matsu): three rounded needle-cloud tiers on a trunk
      return (
        <>
          <rect x="11" y="6.5" width="2" height="16" />
          {PINE_TIERS.map(tier => (
            <g key={tier.fan}>
              <path d={tier.fan} />
              {tier.clumps.map(([cx, cy]) => (
                <circle key={cx} cx={cx} cy={cy} r={tier.r} />
              ))}
            </g>
          ))}
        </>
      );
    case 'blue':
      // Wave: three overlapping seigaiha scales, the upper one tucked behind the lower two
      return (
        <>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <circle cx="6" cy="18" r="7.2" fill="black" />
            <circle cx="18" cy="18" r="7.2" fill="black" />
          </mask>
          <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <g mask={`url(#${maskId})`}>
              <path d="M5.4 12a6.6 6.6 0 0 1 13.2 0" />
              <path d="M8.6 12a3.4 3.4 0 0 1 6.8 0" />
            </g>
            <path d="M0.4 18a5.6 5.6 0 0 1 11.2 0" />
            <path d="M3.3 18a2.7 2.7 0 0 1 5.4 0" />
            <path d="M12.4 18a5.6 5.6 0 0 1 11.2 0" />
            <path d="M15.3 18a2.7 2.7 0 0 1 5.4 0" />
          </g>
        </>
      );
    case 'white':
      // Moon: a crescent
      return (
        <>
          <mask id={maskId}>
            <rect width="24" height="24" fill="white" />
            <circle cx="16.2" cy="9" r="7.4" fill="black" />
          </mask>
          <circle cx="12" cy="12" r="9" mask={`url(#${maskId})`} />
        </>
      );
  }
}

interface SuitEmblemProps {
  color: Color;
  size?: number;
  className?: string;
  // Announce the suit name; leave false when a visible label already says it
  labelled?: boolean;
}

export default function SuitEmblem({ color, size = 16, className, labelled = false }: SuitEmblemProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? SUIT_NAMES[color] : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <Crest color={color} />
    </svg>
  );
}
