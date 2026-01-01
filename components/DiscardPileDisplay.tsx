import { Card, Color } from '@/types/game';

interface DiscardPileDisplayProps {
  discardPile: Card[];
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

export default function DiscardPileDisplay({ discardPile }: DiscardPileDisplayProps) {
  if (discardPile.length === 0) {
    return <p className="text-white/50 text-sm text-center py-4">No cards discarded yet</p>;
  }

  // Group by color first, then by number within each color
  const colorOrder: Color[] = ['red', 'yellow', 'green', 'blue', 'white'];
  const byColor: Record<Color, Record<number, number>> = {
    red: {},
    yellow: {},
    green: {},
    blue: {},
    white: {},
  };

  discardPile.forEach(card => {
    if (!byColor[card.color][card.number]) {
      byColor[card.color][card.number] = 0;
    }
    byColor[card.color][card.number]++;
  });

  return (
    <div className="flex gap-2 pt-3 justify-center">
      {colorOrder.map(color => {
        const hasCards = Object.keys(byColor[color]).length > 0;
        return (
          <div
            key={color}
            className="flex flex-col gap-1.5 items-stretch min-w-[60px] bg-white/5 rounded-xl p-2"
          >
            {/* Color header */}
            <div className="text-xl text-center pb-1 border-b border-white/10">
              {colorEmojis[color]}
            </div>

            {/* Cards of this color, sorted by number */}
            <div className="flex flex-col gap-1.5">
              {hasCards ? (
                Object.entries(byColor[color])
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([number, count]) => (
                    <div
                      key={`${color}-${number}`}
                      className="bg-white/15 rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5"
                    >
                      <span className="text-white font-bold text-sm">{number}</span>
                      {count > 1 && (
                        <span className="text-white/70 text-xs font-medium">×{count}</span>
                      )}
                    </div>
                  ))
              ) : (
                <div className="text-white/20 text-xs text-center py-2">—</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
