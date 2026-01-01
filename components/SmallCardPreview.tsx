import { Card, Color } from '@/types/game';

interface SmallCardPreviewProps {
  card: Card;
  isEditing?: boolean;
}

const colorEmojis: Record<Color, string> = {
  red: '🔴',
  yellow: '🟡',
  green: '🟢',
  blue: '🔵',
  white: '⚪',
};

const colorClasses: Record<Color, string> = {
  red: 'from-red-500 to-red-700',
  yellow: 'from-yellow-400 to-yellow-600',
  green: 'from-green-500 to-green-700',
  blue: 'from-blue-500 to-blue-700',
  white: 'from-gray-100 to-gray-300',
};

export default function SmallCardPreview({ card, isEditing = false }: SmallCardPreviewProps) {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[card.color]} rounded-lg shadow-md w-[60px] h-[84px] border-2 transition-all ${
        isEditing
          ? 'border-amber-400 ring-2 ring-amber-400'
          : 'border-white/30'
      } flex items-center justify-center`}
    >
      <div className="text-center">
        <div className="text-2xl mb-0.5">{colorEmojis[card.color]}</div>
        <div className={`text-xl font-bold ${card.color === 'white' ? 'text-gray-800' : 'text-white'} drop-shadow-md`}>
          {card.number}
        </div>
      </div>
    </div>
  );
}
