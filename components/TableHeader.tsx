import { MAX_HINT_TOKENS, MAX_STRIKES } from '@/types/game';
import Icon from './ui/Icon';

interface TableHeaderProps {
  hintTokens: number;
  strikeTokens: number;
  deckCount: number;
  canUndo: boolean;
  onUndo: () => void;
  onOpenMenu: () => void;
}

const iconButton =
  'flex size-9 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-lacquer-2 hover:text-ink disabled:text-ink-3/50 disabled:hover:bg-transparent';

export default function TableHeader({ hintTokens, strikeTokens, deckCount, canUndo, onUndo, onOpenMenu }: TableHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-lacquer/95 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-xl items-center gap-2 px-3">
        <div className="flex items-center gap-1.5 pl-1">
          <Icon name="burst" size={18} className="text-ink" />
          <span className="text-[15px] font-semibold tracking-tight [font-stretch:108%]">Hanabi</span>
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          {/* Hint tokens */}
          <div className="flex items-center gap-1.5" title="Hint tokens">
            <span className="sr-only">{hintTokens} of {MAX_HINT_TOKENS} hint tokens</span>
            <div className="flex gap-[2px]" aria-hidden="true">
              {Array.from({ length: MAX_HINT_TOKENS }, (_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full ${i < hintTokens ? 'bg-ink' : 'border border-ink-3/70'}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold" aria-hidden="true">{hintTokens}</span>
          </div>

          {/* Strikes */}
          <div className="flex items-center gap-[3px]" title="Strikes">
            <span className="sr-only">{strikeTokens} of {MAX_STRIKES} strikes</span>
            {Array.from({ length: MAX_STRIKES }, (_, i) =>
              i < strikeTokens ? (
                <Icon key={i} name="close" size={14} className="text-ink [stroke-width:3]" />
              ) : (
                <span key={i} aria-hidden="true" className="mx-[3px] size-2 rounded-full border border-ink-3/70" />
              )
            )}
          </div>

          {/* Deck */}
          <div className="flex items-center gap-1 text-ink-2" title="Cards left in the deck">
            <Icon name="deck" size={15} />
            <span className="text-sm font-semibold text-ink">
              {deckCount}
              <span className="sr-only"> cards left in the deck</span>
            </span>
          </div>
        </div>

        <div className="flex items-center">
          <button onClick={onUndo} disabled={!canUndo} aria-label="Undo last action" className={iconButton}>
            <Icon name="undo" />
          </button>
          <button onClick={onOpenMenu} aria-label="Game menu" className={`${iconButton} -mr-1`}>
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}
