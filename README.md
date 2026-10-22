# Hanabi Digital

A phone-friendly companion for playing the card game [Hanabi](https://en.wikipedia.org/wiki/Hanabi_(card_game)) with a physical deck.

In Hanabi you hold your cards facing outward, so you can see everyone's hand except your own. This app keeps track of what's hard to hold in your head:

- **Your own hand:** every clue you receive narrows down what each of your cards could be.
- **Other players' hands:** you enter the cards you can see, and the app works out what each player knows about their own cards from the clues they've received.
- **The table:** fireworks, discard pile, hint tokens, strikes, cards left in the deck, and the final round once the deck runs out.

Everything is saved in the browser's local storage, so a refresh or a locked phone won't lose the game.

## How to use it

1. **Set up.** Pick the number of players, enter names in turn order, and mark which one is you. Blank names fall back to their seat.
2. **Enter the hands you can see**, left to right: tap a suit, then a number, and the card is placed. Tap a card to fix it. You can skip this and fill cards in later.
3. **Record every turn** as it happens at the table. Tap cards to select them; a dock opens at the bottom:
   - **Clue:** pick the color or number. For other players the app selects every matching card for you, as the rules require. For your own hand, select the cards that were pointed at first.
   - **Play / Discard:** with one card selected. For your own card you enter what it turned out to be. When someone else draws, you're asked for their new card (it goes into slot 1).
   - **Move:** reorder a card left or right.
4. Your hand shows what you know: unknown cards list every color and number still possible, take on their color or number as clues land, and turn face-up once fully known. **Their view** shows the same for another player. Your cards also rule out, automatically, any card whose every copy is visible elsewhere (other hands, discards, fireworks, and your own cards you already know); **Deductions** shows why and lets you rule out more yourself. The menu can highlight cards that are safe to play or discard.

Cards use the real deck's five colors, so the table on screen matches the one in front of you. Each suit also carries a small crest (plum, chrysanthemum, pine, wave, moon) as a second cue.

**Undo** (top right) steps back through recent actions. The menu holds the settings, **Focus mode** (turns off rule enforcement and card-entry prompts, for tracking only your own hand), and **New game**.

## Development

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm typecheck
pnpm test       # game-logic tests
pnpm build
```

`pnpm test` runs the tests in `tests/` with Node's built-in test runner, so there's no test framework to install. It compiles `types/`, `utils/` and `tests/` to CommonJS in `.test-build/` (git-ignored) using `tsconfig.test.json`, then runs the compiled files, so a type error fails the run too. `npm test` does the same if pnpm isn't available.

Built with Next.js 16 (App Router), React 19, TypeScript and Tailwind CSS v4.

### Project layout

| Path | What's there |
| --- | --- |
| `app/` | Root layout, metadata and the single page, which switches between setup, card entry and the game |
| `components/` | UI: table header, fireworks, hands, cards, action dock, and sheets for draws, reveals, edits and deductions |
| `types/game.ts` | Game state types and rule constants (hand size, card copies, token limits) |
| `utils/gameActions.ts` | Pure state transitions: give clue, play, discard, final-round countdown |
| `utils/inference.ts` | Card deduction: applying clues, safe-to-play/discard, auto-deductions |
| `utils/storage.ts` | Saving and loading game state (Sets ⇄ arrays for JSON) |
| `tests/` | Tests for the game logic in `types/` and `utils/` (`pnpm test`; runner in `scripts/test.mjs`) |
