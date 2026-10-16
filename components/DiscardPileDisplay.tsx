import { Card, COLORS, NUMBERS, getCopiesPerCard } from '@/types/game';
import SuitEmblem, { SUIT_NAMES, SUIT_TEXT } from './SuitEmblem';

interface DiscardPileDisplayProps {
  discardPile: Card[];
}

export default function DiscardPileDisplay({ discardPile }: DiscardPileDisplayProps) {
  return (
    <section aria-labelledby="discards-heading" className="rounded-2xl border border-rule bg-lacquer p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 id="discards-heading" className="text-base font-semibold tracking-tight [font-stretch:92%]">
          Discards
        </h2>
        <span className="text-sm text-ink-2">{discardPile.length} {discardPile.length === 1 ? 'card' : 'cards'}</span>
      </div>

      {discardPile.length === 0 ? (
        <p className="text-sm text-ink-2">Nothing discarded yet. Misplays land here too.</p>
      ) : (
        // One column per suit, so a variant suit adds a column
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLORS.length}, minmax(0, 1fr))` }}>
          {COLORS.map(color => {
            const counts = NUMBERS.map(n => ({
              number: n,
              count: discardPile.filter(c => c.color === color && c.number === n).length,
            })).filter(entry => entry.count > 0);

            return (
              <div key={color} className="flex min-w-0 flex-col items-center gap-1.5">
                <SuitEmblem color={color} size={18} className={SUIT_TEXT[color]} labelled />
                <ul className="flex w-full flex-col gap-1" aria-label={`${SUIT_NAMES[color]} discards`}>
                  {counts.length === 0 && <li className="sr-only">None</li>}
                  {counts.map(({ number, count }) => {
                    // Every copy gone: this card can never be played. Marked in the suit's own ink,
                    // struck through, so the warning never borrows another suit's color
                    const lost = count >= getCopiesPerCard(number);
                    return (
                      <li
                        key={number}
                        title={lost ? 'Every copy is gone' : undefined}
                        className={`flex items-center justify-center gap-1 rounded-md py-1 text-sm ${
                          lost ? `border border-dashed border-current ${SUIT_TEXT[color]}` : 'bg-lacquer-2'
                        }`}
                      >
                        <span className={`font-extrabold [font-stretch:80%] ${lost ? 'line-through decoration-2' : ''}`}>
                          {number}
                        </span>
                        {count > 1 && <span className="text-xs text-ink-2">×{count}</span>}
                        {lost && <span className="sr-only">, every copy lost</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
