---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["components/GameView.tsx","components/GameSetup.tsx","components/CardInputScreen.tsx"]
---

# Surface: Hanabi Digital app (setup, card entry, table)

Mode: Operate. One player's phone at a physical Hanabi table, glanced at between turns, any light.

Job: record each turn (clue, play, discard, draw) in a few taps; read at a glance what I know about my hand and what the others know about theirs.

Must keep: every function of the current app (setup, initial deal entry, clues to anyone incl. me with auto-touch, play/discard/draw, reorder, edit hands, deductions, safe-play/discard hints, focus mode, undo, final-round countdown, game over). Flow may change: owner approved restructuring.

Balance: calm and quick during play; a little celebration at the right moments (a card becoming known, a firework completed, the end).

## Direction contract

THESIS: Hanabi's cards printed as a hanafuda deck: thick, flat-inked, black-keylined cards whose suits are told by crest as much as color, laid on a lacquer table. Refuses the category default of a purple-gradient dashboard with emoji chips and per-card button clutter.

OWN-WORLD: Sumi lacquer ground and panels, gofun-white type and selection ring, five woodblock suit inks (beni red, yamabuki yellow, matsuba green, ai blue, gofun white), each paired with a crest glyph (plum, chrysanthemum, pine, wave, moon). Cards are 3:5 slabs with a dark keyline; unknown cards are sumi backs with a vermilion inner frame. One sturdy grotesque (Archivo, width axis) for UI and card numerals. Drawn SVG icons only.

STORY: The player sees the table state at the top, every hand on one screen, taps cards to select them, and acts from a bottom dock (clue, play, discard, move). They trust it because nothing they learned ever vanishes: ruled-out options stay visible, struck.

FIRST VIEWPORT: Sticky lacquer header: wordmark, hint pips, strikes, deck, undo, menu. Below, the fireworks rail: five mini cards with score. Then my hand: card backs carrying suit-crest and number strips, developing toward a face as clues land. Then each other player's hand of face cards with clue log. Bottom dock appears on selection.

FORM: Hanafuda Deck, my top-ranked grounded candidate (position 1), chosen as the pick card. Seed key 9a8bea8b. Signature move: a card develops from back to face as clues narrow it, flipping face-up the moment it's fully known.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
