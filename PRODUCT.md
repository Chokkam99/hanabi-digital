# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The owner and their regular Hanabi group. Each player may open the app on their own phone during a game, so it has to be self-explanatory to someone who didn't set it up, while still fast for the owner who uses it every game night. Players know Hanabi's rules; they don't need the game taught, they need its bookkeeping handled.

## Product Purpose

A companion for playing Hanabi with a physical deck. In Hanabi you hold your cards facing outward: you see everyone's hand but your own, and you only learn about your cards through clues. The app holds what's hard to keep in your head:

- what every clue you received says about each of your cards (including the negative information: "these aren't red");
- the other players' visible hands, entered by you, and what each of them knows about their own cards from their clues;
- the table state: fireworks, discard pile, hint tokens, strikes, cards left in the deck, and the final-round countdown.

Success: a player can record a turn in a few taps without breaking the flow of the game, and can glance at their hand and know what's safe to play or discard.

## Positioning

Not a digital Hanabi game (those replace the cards); it sits beside a real deck at a real table and does the inference work a player would otherwise do from memory, including modeling what the *other* players know.

## Operating Context

- Phone in hand at the table, glanced at between turns; one-handed, short bursts.
- Any room and any light: evening living rooms, cafés, daytime sessions. It has to read well everywhere.
- Every turn at the table is one action in the app: a clue (to anyone, including me), a play, or a discard. Drawn cards for other players are entered as they're seen.
- State persists in the browser so a locked phone or reload doesn't lose the game.

## Capabilities and Constraints

- 2–5 players; hand size 5 (2–3 players) or 4 (4–5 players); base deck of 50 cards: five colors, three 1s, two each of 2–4, one 5 per color.
- 8 hint tokens, 3 strikes, max score 25. Game ends on the third strike, at 25 points, or one round after the last card is drawn.
- Newly drawn cards enter at the left (slot 1). Cards can be reordered.
- Clues to other players auto-select every matching card, because the rules require a clue to touch all of them.
- Deductions: count-based auto-exclusion from visible cards (other hands, discards, fireworks) plus manual exclusions; optional safe-to-play and safe-to-discard highlighting.
- Undo (in-memory, recent actions). Focus Mode turns off rule enforcement and card-entry prompts for players tracking only their own hand.
- Variants (rainbow / multicolor, a sixth suit) are not built, but should remain possible: avoid baking "exactly five colors" into layouts and identity.
- Next.js App Router, React 19, Tailwind CSS v4; client-only state in localStorage; no backend.

## Brand Commitments

Name: Hanabi Digital. The app icon (`app/icon.svg`, a firework burst) exists. No other binding brand assets or voice.

## Evidence on Hand

None beyond the app itself. No testimonials, users, or statistics exist; don't invent any.

## Product Principles

1. The table comes first: recording a turn must never take longer than the turn itself.
2. Glanceable truth: what I know about my hand should be readable in a second, from arm's length, in any light.
3. Color is information. In Hanabi, the five suit colors carry meaning, so they can never be decoration or be confused with UI state.
4. Forgiving by default: every action can be undone or corrected, because entries happen mid-conversation.
5. Self-explanatory for a friend who just picked up the phone.

## Accessibility & Inclusion

Inferred, not yet confirmed by the owner:

- Suit colors should never be the only signal; pair every color with a distinct symbol or label so color-blind players in the group can use it (red/green and yellow/white are the usual confusions).
- Large tap targets for one-handed use; legible in bright and dim rooms (the confirmed "any light" setting).
