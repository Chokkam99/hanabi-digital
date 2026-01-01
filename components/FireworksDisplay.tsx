import { Fireworks, Color, COLORS } from '@/types/game';

interface FireworksDisplayProps {
  fireworks: Fireworks;
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

const colorClasses: Record<Color, string> = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  white: 'bg-gray-100',
};

export default function FireworksDisplay({ fireworks }: FireworksDisplayProps) {
  return (
    <div className="flex gap-2 pt-3 justify-center">
      {COLORS.map((color) => (
        <div
          key={color}
          className="flex flex-col gap-1.5 items-stretch min-w-[60px] bg-white/5 rounded-xl p-2"
        >
          {/* Color header */}
          <div className="text-xl text-center pb-1 border-b border-white/10">
            {colorEmojis[color]}
          </div>

          {/* Current firework level */}
          <div className="bg-white/15 rounded-lg py-3 px-2 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {fireworks[color] > 0 ? fireworks[color] : '—'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
