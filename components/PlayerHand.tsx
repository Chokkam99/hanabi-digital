'use client';

import { useState } from 'react';
import { Player, GameState, CardPossibilities, Card, Clue, Color, CardNumber } from '@/types/game';
import { computePlayerKnowledge, getFinalPossibilities, isSafeToPlay, isSafeToDiscard } from '@/utils/inference';
import { CardFace, EmptySlot, KnowledgeCard } from './Card';
import SuitEmblem, { SUIT_TEXT } from './SuitEmblem';
import Icon from './ui/Icon';

interface PlayerHandProps {
  player: Player;
  gameState: GameState;
  handSize: number;
  selectedCardIds: string[];
  onToggleCard: (cardId: string) => void;
  onEditCards?: () => void;
  onOpenDeductions?: () => void;
}

const headerButton =
  'flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold text-ink-2 transition-colors hover:bg-lacquer-2 hover:text-ink';

function ClueChip({ clue, hand }: { clue: Clue; hand: (Card | CardPossibilities)[] }) {
  // Slots the clue's touched cards occupy now (cards move as they're played and drawn)
  const slots = clue.cardIds
    .map(id => hand.findIndex(c => c.id === id))
    .filter(pos => pos !== -1)
    .map(pos => pos + 1);

  return (
    <li className="flex shrink-0 items-center gap-1.5 rounded-full border border-rule bg-lacquer px-2.5 py-1 text-[13px]">
      {clue.type === 'color' ? (
        <SuitEmblem color={clue.value as Color} size={14} className={SUIT_TEXT[clue.value as Color]} labelled />
      ) : (
        <span className="font-extrabold [font-stretch:80%]">{clue.value as CardNumber}</span>
      )}
      <Icon name="arrow-right" size={12} className="text-ink-3" />
      <span className="text-ink-2">
        {slots.length > 0 ? (
          <>
            <span className="sr-only">on slots </span>
            {slots.join(' · ')}
          </>
        ) : (
          'gone'
        )}
      </span>
    </li>
  );
}

export default function PlayerHand({
  player,
  gameState,
  handSize,
  selectedCardIds,
  onToggleCard,
  onEditCards,
  onOpenDeductions,
}: PlayerHandProps) {
  // For other players: show their cards as they see them (from the clues they've had)
  const [theirView, setTheirView] = useState(false);
  const { settings, fireworks, discardPile } = gameState;

  const hand = player.hand as (Card | CardPossibilities)[];
  const knowledge: CardPossibilities[] | null = player.isMe
    ? (player.hand as CardPossibilities[]).map(card => {
        if (!settings.showDeductions) return card;
        const { colors, numbers } = getFinalPossibilities(card);
        return { ...card, possibleColors: colors, possibleNumbers: numbers };
      })
    : theirView
    ? computePlayerKnowledge(player.hand as Card[], player.cluesReceived)
    : null;

  // Other players may not have every card entered yet; I never do (my hand only shrinks at the end)
  const emptySlots = player.isMe ? 0 : Math.max(handSize - hand.length, 0);
  const recentClues = player.cluesReceived.slice(-6).reverse();
  const olderClues = player.cluesReceived.length - recentClues.length;

  return (
    <section id={`hand-section-${player.id}`} aria-labelledby={`hand-${player.id}`} className="scroll-mt-20 space-y-3">
      <div className="flex items-center gap-2">
        <h2 id={`hand-${player.id}`} className="text-lg font-semibold tracking-tight [font-stretch:92%]">
          {player.isMe ? 'Your hand' : player.name}
        </h2>
        {player.isMe && <span className="text-sm text-ink-3">{player.name}</span>}

        <div className="ml-auto flex items-center">
          {player.isMe ? (
            <button onClick={onOpenDeductions} className={headerButton}>
              <Icon name="notes" size={16} />
              Deductions
            </button>
          ) : (
            <>
              <button
                onClick={() => setTheirView(v => !v)}
                aria-pressed={theirView}
                className={`${headerButton} ${theirView ? 'bg-ink text-mat hover:bg-white hover:text-mat' : ''}`}
              >
                <Icon name="eye" size={16} />
                Their view
              </button>
              <button onClick={onEditCards} aria-label={`Edit ${player.name}'s cards`} className={`${headerButton} px-2.5`}>
                <Icon name="pencil" size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      <ol
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${handSize}, minmax(0, 1fr))` }}
      >
        {hand.map((card, index) => {
          const selected = selectedCardIds.includes(card.id);
          const known = knowledge?.[index];
          const safePlay = known && settings.showSafeToPlay && isSafeToPlay(known, fireworks);
          const safeDiscard =
            known && !safePlay && settings.showSafeToDiscard && isSafeToDiscard(known, fireworks, discardPile);

          return (
            <li key={card.id} className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => onToggleCard(card.id)}
                aria-pressed={selected}
                aria-label={`Slot ${index + 1}${selected ? ', selected' : ''}`}
                className={`relative w-full rounded-[10%/6%] transition-transform duration-200 ease-out ${
                  selected ? '-translate-y-2 ring-2 ring-ink ring-offset-[3px] ring-offset-mat' : 'active:scale-[0.97]'
                }`}
              >
                {known ? (
                  <KnowledgeCard possibleColors={known.possibleColors} possibleNumbers={known.possibleNumbers} />
                ) : (
                  <CardFace color={(card as Card).color} number={(card as Card).number} />
                )}

                {selected && (
                  <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-ink text-mat shadow-md">
                    <Icon name="check" size={14} className="[stroke-width:2.5]" />
                  </span>
                )}

                {(safePlay || safeDiscard) && (
                  <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-mat uppercase shadow-md">
                    <Icon name={safePlay ? 'play' : 'discard'} size={10} className="[stroke-width:2.5]" />
                    {safePlay ? 'Play' : 'Trash'}
                  </span>
                )}
              </button>
              <span className={`text-xs font-semibold ${selected ? 'text-ink' : 'text-ink-3'}`}>{index + 1}</span>
            </li>
          );
        })}

        {Array.from({ length: emptySlots }, (_, i) => (
          <li key={`empty-${i}`} className="flex flex-col items-center gap-1.5">
            <button
              onClick={onEditCards}
              aria-label={`Enter ${player.name}'s card for slot ${hand.length + i + 1}`}
              className="w-full transition-transform active:scale-[0.97]"
            >
              <EmptySlot label="Add card" />
            </button>
            <span className="text-xs font-semibold text-ink-3">{hand.length + i + 1}</span>
          </li>
        ))}
      </ol>

      {player.cluesReceived.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="shrink-0 text-xs font-medium text-ink-3">Clues</span>
          <ul className="scrollbar-hide flex gap-1.5 overflow-x-auto" aria-label={`Clues ${player.isMe ? 'you' : player.name} received, newest first`}>
            {recentClues.map(clue => (
              <ClueChip key={clue.id} clue={clue} hand={hand} />
            ))}
            {olderClues > 0 && (
              <li className="flex shrink-0 items-center px-1 text-[13px] text-ink-3">+{olderClues} earlier</li>
            )}
          </ul>
        </div>
      )}

      {theirView && !player.isMe && (
        <p className="text-xs text-ink-2">
          Showing what {player.name} knows from the clues they&apos;ve received.
        </p>
      )}
    </section>
  );
}

