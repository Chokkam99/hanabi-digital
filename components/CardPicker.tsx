import { Color, CardNumber, COLORS, NUMBERS } from '@/types/game';
import SuitEmblem, { SUIT_BG, SUIT_NAMES, SUIT_ON } from './SuitEmblem';

interface CardPickerProps {
  selectedColor: Color | null;
  selectedNumber: CardNumber | null;
  onSelectColor: (color: Color) => void;
  onSelectNumber: (number: CardNumber) => void;
  // Options still possible from clues; the rest are shown quieter (but stay tappable)
  likelyColors?: Set<Color>;
  likelyNumbers?: Set<CardNumber>;
}

const selectedRing = 'ring-2 ring-ink ring-offset-2 ring-offset-lacquer';

/**
 * Suit + number selector for entering a card
 */
export default function CardPicker({
  selectedColor,
  selectedNumber,
  onSelectColor,
  onSelectNumber,
  likelyColors,
  likelyNumbers,
}: CardPickerProps) {
  return (
    // Headroom so the selected option's ring isn't clipped by a scrolling parent
    <div className="space-y-3 pt-1.5">
      {/* One column per suit, so a variant suit adds a column */}
      <div
        role="group"
        aria-label="Suit"
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${COLORS.length}, minmax(0, 1fr))` }}
      >
        {COLORS.map(color => {
          const selected = selectedColor === color;
          const unlikely = likelyColors && !likelyColors.has(color);
          return (
            <button
              key={color}
              onClick={() => onSelectColor(color)}
              aria-label={SUIT_NAMES[color]}
              aria-pressed={selected}
              className={`flex h-14 items-center justify-center rounded-xl border-[1.5px] border-keyline transition-[transform,opacity,box-shadow] duration-150 active:scale-95 ${SUIT_BG[color]} ${SUIT_ON[color]} ${
                selected ? `${selectedRing} scale-105` : unlikely ? 'opacity-35' : ''
              }`}
            >
              <SuitEmblem color={color} size={26} />
            </button>
          );
        })}
      </div>

      <div role="group" aria-label="Number" className="grid grid-cols-5 gap-2">
        {NUMBERS.map(number => {
          const selected = selectedNumber === number;
          const unlikely = likelyNumbers && !likelyNumbers.has(number);
          return (
            <button
              key={number}
              onClick={() => onSelectNumber(number)}
              aria-pressed={selected}
              className={`flex h-14 items-center justify-center rounded-xl text-2xl transition-[transform,background-color,color] duration-150 [font-stretch:80%] active:scale-95 ${
                selected
                  ? `bg-lacquer-3 font-black text-ink ${selectedRing} scale-105`
                  : `border border-rule bg-lacquer-2 font-extrabold text-ink hover:bg-lacquer-3 ${unlikely ? 'opacity-35' : ''}`
              }`}
            >
              {number}
            </button>
          );
        })}
      </div>
    </div>
  );
}
