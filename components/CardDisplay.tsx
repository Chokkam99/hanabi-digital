import { CardPossibilities, Card, GameState, Color, CardNumber } from '@/types/game';
import { isSafeToPlay, isSafeToDiscard, getPossibilityCount } from '@/utils/inference';

interface CardDisplayProps {
  card: CardPossibilities | Card;
  position: number;
  isMyHand: boolean;
  showKnowledge: boolean;
  gameState: GameState;
  // NEW: For play/discard actions
  onPlay?: (position: number) => void;
  onDiscard?: (position: number) => void;
  showActionButtons?: boolean;
  // NEW: For hint selection
  isSelected?: boolean;
  onToggleSelect?: (position: number) => void;
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

function isCardPossibilities(card: CardPossibilities | Card): card is CardPossibilities {
  return 'possibleColors' in card;
}

export default function CardDisplay({
  card,
  position,
  isMyHand,
  showKnowledge,
  gameState,
  onPlay,
  onDiscard,
  showActionButtons = false,
  isSelected = false,
  onToggleSelect,
}: CardDisplayProps) {
  // Show possibilities (for my hand or when viewing other player's knowledge)
  if (isCardPossibilities(card) && showKnowledge) {
    const safeToPlay =
      gameState.settings.showSafeToPlay && isSafeToPlay(card, gameState.fireworks);
    const safeToDiscard =
      gameState.settings.showSafeToDiscard &&
      isSafeToDiscard(card, gameState.fireworks, gameState.discardPile);

    const possibilityCount = getPossibilityCount(card);
    const isNarrowed = possibilityCount <= 5;

    return (
      <div className="relative">
        <div
          onClick={onToggleSelect ? () => onToggleSelect(position) : undefined}
          className={`bg-gradient-to-br from-purple-600/30 to-purple-800/30 rounded-xl p-2 border-2 ${
            isNarrowed ? 'border-yellow-400' : isSelected ? 'border-green-500 ring-4 ring-green-500' : 'border-white/20'
          } w-[110px] flex flex-col ${onToggleSelect ? 'cursor-pointer hover:scale-105' : ''} transition-all`}
        >
          {/* Card Position & Count */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/50 text-[10px] font-bold">#{position + 1}</span>
            <span className="text-white/40 text-[10px]">{possibilityCount}</span>
          </div>

          {/* Colors & Numbers - Side by Side */}
          <div className="flex gap-2 mb-2">
            {/* Colors Column */}
            <div className="flex-1 flex flex-col items-center gap-0.5">
              {Array.from(card.possibleColors).map((color) => (
                <span key={color} className="text-xl leading-none">
                  {colorEmojis[color]}
                </span>
              ))}
              {card.possibleColors.size === 0 && (
                <span className="text-white/30 text-[10px]">-</span>
              )}
            </div>

            {/* Numbers Column */}
            <div className="flex-1 flex flex-col items-center gap-0.5">
              {Array.from(card.possibleNumbers).map((number) => (
                <span key={number} className="text-white font-bold text-sm px-2 py-0.5 bg-white/10 rounded leading-none">
                  {number}
                </span>
              ))}
              {card.possibleNumbers.size === 0 && (
                <span className="text-white/30 text-[10px]">-</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActionButtons && onPlay && onDiscard && (
            <div className="space-y-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(position);
                }}
                className={`w-full py-1 rounded text-[10px] font-semibold transition-all ${
                  safeToPlay && gameState.settings.showSafeToPlay
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                ▶
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard(position);
                }}
                disabled={gameState.hintTokens >= 8 && !gameState.settings.focusMode}
                className={`w-full py-1 rounded text-[10px] font-semibold transition-all ${
                  safeToDiscard && gameState.settings.showSafeToDiscard
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                    : gameState.hintTokens >= 8 && !gameState.settings.focusMode
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                🗑
              </button>
            </div>
          )}
        </div>
        {isSelected && (
          <div className="absolute top-1 right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
      </div>
    );
  }

  // Show actual card (for other players when not viewing their knowledge)
  if (!isCardPossibilities(card) && !showKnowledge) {
    const actualCard = card as Card;

    // Check if this is a placeholder card (number is not a valid CardNumber)
    const isPlaceholder = !(actualCard.number >= 1 && actualCard.number <= 5);

    if (isPlaceholder) {
      // Render empty/dotted placeholder with same size as actual cards
      return (
        <div className="relative">
          <div className="bg-white/10 rounded-xl shadow-lg w-[110px] border-2 border-dashed border-white/30 flex flex-col">
            {/* Main content area - matches actual card's flex-1 section */}
            <div className="flex-1 flex items-center justify-center p-4 min-h-[100px]">
              <div className="text-center text-white/40">
                <div className="text-3xl mb-1">📝</div>
                <div className="text-[10px] font-semibold">Not entered</div>
              </div>
            </div>

            {/* Spacer for action buttons area - matches actual card's button section */}
            {showActionButtons && (
              <div className="p-2 space-y-1">
                <div className="w-full h-[18px]"></div>
                <div className="w-full h-[18px]"></div>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <div
          onClick={onToggleSelect ? () => onToggleSelect(position) : undefined}
          className={`bg-gradient-to-br ${colorClasses[actualCard.color]} rounded-xl shadow-lg w-[110px] min-h-[140px] border-2 transition-all flex flex-col ${
            isSelected
              ? 'border-green-500 ring-4 ring-green-500 scale-105'
              : 'border-white/30'
          } ${onToggleSelect ? 'cursor-pointer hover:scale-105' : ''}`}
        >
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-4xl mb-2">{colorEmojis[actualCard.color]}</div>
              <div className={`text-3xl font-bold ${actualCard.color === 'white' ? 'text-gray-800' : 'text-white'} drop-shadow-lg`}>
                {actualCard.number}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {showActionButtons && onPlay && onDiscard && (
            <div className="space-y-1 p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlay(position);
                }}
                className="w-full py-1 rounded text-[10px] font-semibold transition-all bg-white/20 hover:bg-white/30 text-white"
              >
                ▶
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDiscard(position);
                }}
                disabled={gameState.hintTokens >= 8 && !gameState.settings.focusMode}
                className={`w-full py-1 rounded text-[10px] font-semibold transition-all ${
                  gameState.hintTokens >= 8 && !gameState.settings.focusMode
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                🗑
              </button>
            </div>
          )}
        </div>
        <div className="absolute top-1 left-1 bg-white/90 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
          <span className="text-[10px] font-bold text-purple-900">{position + 1}</span>
        </div>
        {isSelected && (
          <div className="absolute top-1 right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-md">
            <span className="text-white text-xs font-bold">✓</span>
          </div>
        )}
      </div>
    );
  }

  // Fallback (shouldn't happen)
  return <div className="bg-white/10 rounded-xl p-2 w-[110px] h-[140px]" />;
}
