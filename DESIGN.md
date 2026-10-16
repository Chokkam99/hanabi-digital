---
name: Hanabi Digital
description: A table companion for real-deck Hanabi, printed as a hanafuda deck on a lacquer table.
colors:
  mat: "#131113"
  lacquer: "#1c191b"
  lacquer-2: "#262225"
  lacquer-3: "#322d30"
  rule: "#3b3538"
  keyline: "#0b0a0b"
  card-back: "#221e20"
  ink: "#efede8"
  ink-2: "#b8b1ae"
  ink-3: "#857c7e"
  suit-red: "#e1352b"
  suit-yellow: "#f6c71b"
  suit-green: "#2e9a46"
  suit-blue: "#1f6ec4"
  suit-white: "#f5f5f2"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 112"
  score:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 80"
  card-numeral:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "40cqw"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 75"
  key-numeral:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1
    fontVariation: "'wdth' 80"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 92"
  wordmark:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 108"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.43
    fontFeature: "'tnum' 1"
  body-small:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.375
    fontFeature: "'tnum' 1"
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.33
    fontFeature: "'tnum' 1"
rounded:
  card: "10% / 6%"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  hairline: "2px"
  card-gap: "8px"
  card-gap-wide: "12px"
  page-x: "16px"
  sheet-x: "20px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "#ffffff"
    textColor: "{colors.mat}"
  button-primary-disabled:
    backgroundColor: "{colors.lacquer-3}"
    textColor: "{colors.ink-3}"
  button-primary-lg:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.xl}"
    padding: "0 20px"
    height: "52px"
  button-secondary:
    backgroundColor: "{colors.lacquer-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.lacquer-3}"
  button-ghost:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-ghost-hover:
    backgroundColor: "{colors.lacquer-2}"
    textColor: "{colors.ink}"
  button-danger:
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "44px"
  button-danger-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
  icon-button:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.full}"
    size: "36px"
  card-back:
    backgroundColor: "{colors.card-back}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  suit-tile:
    rounded: "{rounded.xl}"
    height: "48px"
  number-key:
    backgroundColor: "{colors.lacquer-3}"
    textColor: "{colors.ink}"
    typography: "{typography.key-numeral}"
    rounded: "{rounded.xl}"
    height: "48px"
  number-key-selected:
    backgroundColor: "{colors.lacquer-3}"
    textColor: "{colors.ink}"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.xl}"
    height: "48px"
  clue-chip:
    backgroundColor: "{colors.lacquer}"
    textColor: "{colors.ink-2}"
    typography: "{typography.body-small}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-badge:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.mat}"
    rounded: "{rounded.full}"
    padding: "2px 6px"
  text-field:
    backgroundColor: "{colors.lacquer}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "0 16px"
    height: "48px"
  sheet:
    backgroundColor: "{colors.lacquer}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "20px"
    width: "448px"
  action-dock:
    backgroundColor: "{colors.lacquer-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    padding: "12px 16px"
    width: "576px"
  panel:
    backgroundColor: "{colors.lacquer}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  switch-on:
    backgroundColor: "{colors.ink}"
    rounded: "{rounded.full}"
    width: "48px"
    height: "28px"
  switch-off:
    backgroundColor: "{colors.lacquer-3}"
    rounded: "{rounded.full}"
    width: "48px"
    height: "28px"
---

# Design System: Hanabi Digital

## Overview

**Creative North Star: "The Hanafuda Deck on a Lacquer Table"**

Hanabi's cards printed as a hanafuda deck: thick, flat-inked slabs with a near-black keyline, laid on a dark sumi-lacquer table. Each suit is a woodblock ink paired with a crest, so a card reads by shape as much as by color. Everything that isn't a card (header, panels, sheets, the action dock) is lacquer in quiet steps, with gofun white as the only ink for type, selection and the single primary action. The cards carry all the color; the furniture carries none.

The density is a phone at a real table, read in short glances: every hand on one scrolling column, cards sized to fill the row, big condensed numerals, and actions held back in a bottom dock until cards are selected. The signature move is the card that *develops*. An unknown card is a back printed with every remaining crest and number. A known color floods the field, a known number prints large, and the card flips face-up the moment both are known. Nothing a player learned ever vanishes: ruled-out options stay on the card, quieted and struck through.

Motion is rare and earned. A card turns over when it becomes fully known or lands on a firework, a ring of light bursts when a firework completes, and sheets and the dock slide up. Nothing animates on load, and reduced motion collapses all of it.

**Key Characteristics:**
- Dark lacquer ground in five near-black steps, warm-tinted; gofun-white ink in three steps.
- Five suit inks matched to the physical deck, each always paired with its crest.
- 3:5 card slabs with a 1.5px keyline, a pale stock rim and a soft drop; everything inside scales with the card.
- One grotesque (Archivo) whose width axis does the hierarchy work: condensed numerals, normal UI, wide wordmark.
- Drawn line icons and SVG crests only.
- State expressed in ink, weight, rings, strikes and icons, never in a hue.

## Colors

A warm sumi-lacquer neutral scale and gofun-white ink frame five full-strength suit inks that only ever mean a suit.

### Primary
- **Gofun White** (ink): all primary text, the primary button fill, the selection ring, the focus outline, text selection, hint pips, strike marks and status badges. It is the system's only "accent", and it is achromatic on purpose.

### Secondary (the suit inks)
These are not brand accents. They are the five suits of the physical Hanabi deck, matched to the real cards at the owner's request, because color is how players tell cards apart.
- **Beni Red** (suit-red): the red suit, paired with the plum-blossom crest. Ink printed on it is gofun white.
- **Yamabuki Yellow** (suit-yellow): the yellow suit, paired with the chrysanthemum crest. Ink printed on it is keyline black.
- **Matsuba Green** (suit-green): the green suit, paired with the pine crest. Ink printed on it is gofun white.
- **Ai Blue** (suit-blue): the blue suit, paired with the three-scale seigaiha wave crest. Ink printed on it is gofun white.
- **Gofun Card White** (suit-white): the white suit, paired with the crescent-moon crest. Ink printed on it is keyline black. A shade brighter and cooler than UI ink so a white card never reads as a UI surface.

### Neutral
- **Sumi Mat** (mat): the table itself; page background, browser theme color and manifest background. Ring offsets on the table use it.
- **Lacquer** (lacquer): raised panels: the sticky header (at 95% with a backdrop blur), sheets, the discard panel, notices, clue chips and text fields.
- **Lacquer Two** (lacquer-2): the action dock, secondary buttons, number keys in pickers, hover on ghost controls.
- **Lacquer Three** (lacquer-3): pressed or hovered lacquer, number keys in the dock, the off switch track, disabled primary fill.
- **Rule** (rule): 1px dividers, panel and chip borders, dashed empty-slot outlines, scrollbar thumb.
- **Keyline** (keyline): the 1.5px outline on every card and suit tile, and dark ink on the yellow and white suits.
- **Card Back** (card-back): the field of an unknown card, a step between lacquer and lacquer-2. It is printed with a double-ruled frame in gofun white at 25% and 10%.
- **Ink Two** (ink-2): secondary text, descriptions, icon-button glyphs at rest.
- **Ink Three** (ink-3): tertiary text on the mat (slot numbers, "Clues" label, footnotes) and the color of ruled-out options on lacquer and card backs.

### Named Rules
**The Suit-Only Hue Rule.** A hue only ever names its suit. Selection, danger, strikes, warnings and errors are expressed in gofun ink, weight, rings, strikes and icons, never in a suit color and never in a red. A suit's own ink may mark that suit's own things (its crest on a clue chip, its empty firework outline, its burst ring, a dashed and struck discard cell where every copy is gone). It never marks anything else. The former vermilion token was removed for this reason.

**The Crest-With-Color Rule.** A suit color never appears alone. Every suit tile, card face, chip and discard column pairs the color with its crest, so suits stay distinct for color-blind players and in bad light.

**The Achromatic Furniture Rule.** Lacquer surfaces stay tinted near-black (chroma under 0.01). If a non-card surface picks up a hue, it has started competing with the cards.

## Typography

**Display Font:** Archivo (with ui-sans-serif, system-ui, sans-serif), loaded via next/font with the width axis
**Body Font:** Archivo, same family
**Label/Mono Font:** none; numerals use tabular figures set on the body

**Character:** One sturdy grotesque does everything, with the width axis carrying the hierarchy: numerals run condensed and heavy like printed card indices, UI runs at normal width, and the wordmark and setup title run wide.

### Hierarchy
- **Display** (bold, 34px, width 112, tight tracking): the setup screen title only.
- **Score** (extrabold, 40px on the fireworks rail, 72px on the game-over sheet, width 80): the running and final score.
- **Card Numeral** (extrabold, 40% of card width on faces and 46% when a back knows its number, width 75): card indices. Option strips on backs run at 17 to 18% of card width, width 75 to 80.
- **Key Numeral** (extrabold, 20px in the dock, 24px in the picker, width 80; black weight when selected): number keys, player-count segments and discard cells.
- **Headline** (semibold, 18px, width 92, tight tracking): hand titles and sheet titles; 16px for the discard panel title and 20px for the deal screen title.
- **Wordmark** (semibold, 15px, width 108): "Hanabi" in the header beside the burst icon.
- **Body** (regular, 14px; 15px for setup lead and switch labels): notices, dock summaries, descriptions.
- **Body Small** (regular, 13px): clue chips, instructional lines, switch descriptions.
- **Caption** (semibold, 12px): slot numbers under cards, small helper lines.

### Named Rules
**The Width-Axis Rule.** Hierarchy comes from width and weight on one family, not from a second typeface. Numerals that identify cards are condensed (75 to 80); titles sit near normal (92); only the name of the app runs wide.

**The Tabular Table Rule.** Body numerals are tabular everywhere, so counts in the header, rail and discard pile don't jitter as they change.

## Layout

A single centered column (max 576px) with 16px side padding, reading top to bottom: sticky header (56px tall plus the safe-area inset), fireworks rail, my hand, every other hand in turn order after me, then the discard panel. Sections are separated by 28px. Hands are grids whose column count equals the hand size, so cards fill the row and scale with the phone. Card gaps are 8px, 12px from 640px up.

Rows that list suits derive their column count from the number of suits in play (fireworks rail, suit tiles in the dock and picker, discard columns, card-back option rows). Number grids stay fixed at five.

The action dock and the deal-screen confirm bar are fixed to the bottom, share the column width, and pad below by the safe-area inset (at least 16px). While the dock is open, the page adds 288px of bottom padding so the last hand can scroll clear of it. Sheets are bottom sheets on phones (max 92% of the dynamic viewport height, 20px padding) and become centered 448px panels from 640px up.

## Elevation & Depth

Mostly flat lacquer with tonal stepping for raised furniture. Real shadow is reserved for two things: the printed card stock, and surfaces that float over the table (sheets, the dock).

### Shadow Vocabulary
- **Card Stock** (`box-shadow: 0 0 0 1px rgba(255,255,255,0.16), inset 0 1px 0 rgba(255,255,255,0.22), 0 3px 8px rgba(0,0,0,0.55)`): every card face and card back. A pale rim where the stock meets the table, a top highlight, and a soft drop.
- **Sheet Lift** (`box-shadow: 0 -12px 40px rgba(0,0,0,0.5)`): bottom sheets and dialogs, over a 65% black scrim.
- **Dock Lift** (`box-shadow: 0 -10px 30px rgba(0,0,0,0.5)`): the action dock and deal-screen confirm bar.
- **Badge Lift** (a small soft shadow): the selected check and status badge sitting on a card's corner or edge.

### Named Rules
**The Printed Stock Rule.** Only cards get the stock treatment. Panels, chips and keys stay flat, with tone and a 1px rule doing their separation.

## Shapes

Cards are 3:5 slabs with elliptical corners proportional to their size (10% of width by 6% of height), outlined by a 1.5px keyline. The card-back frames nest at the same proportion, slightly tighter. Interactive controls use gently rounded 12px corners (buttons, keys, suit tiles, inputs, segments). Floating and container surfaces use 16px (sheets, dock, discard panel, setup segment track). Small option squares use 8px, discard cells 6px, and pills, chips, icon buttons, pips and switches are fully round. Empty places where a card belongs are dashed outlines in the card silhouette. A suit's empty firework is dashed in its suit ink at 45%, with its crest at 35%.

## Components

### Buttons
Solid, quick, and plainly labelled, with a drawn line icon where the action has one.
- **Shape:** gently rounded (12px), 44px tall (52px for the large sheet-level action), semibold.
- **Primary:** gofun ink fill with mat text; brightens to pure white on hover; disabled drops to lacquer-3 with ink-3 text. One per screen or dock state.
- **Secondary:** lacquer-2 with a 1px rule border and ink text; lacquer-3 on hover.
- **Ghost:** ink-2 text on nothing; lacquer-2 fill and ink text on hover.
- **Danger:** transparent with an ink-3 border and ink text; inverts to an ink fill on hover. Destructive actions are told by placement, wording and a confirm step, not by color.
- **Press:** every button scales to 0.97 over 150ms; focus shows a 2px gofun outline offset 2px.
- **Icon buttons:** 36px round (40px for sheet close), ink-2 glyph, lacquer-2 fill on hover; disabled glyph at ink-3 50%.

### Chips
- **Clue chip:** round pill on lacquer with a rule border, 13px. It shows the clue (the suit crest in its own ink, or a condensed numeral), a small ink-3 arrow, and the slots it touched in ink-2. Chips sit in a horizontally scrolling row with no visible scrollbar.
- **Status badge:** a small gofun pill (10px bold, uppercase, slightly tracked, mat text) with a play or discard glyph, centred on the bottom edge of a card to mark a safe play or a safe discard. This is the only uppercase text in the system, and it exists to fit inside a card's width. It is not a label style for headings.

### Cards / Containers
- **Panel:** lacquer with a 1px rule border, 16px corners, 16px padding (the discard pile). Notices use the same lacquer with an ink-3 border and 12px corners, led by a line icon.
- **Sheet:** lacquer, rule border, 16px top corners on phones (all corners from 640px), a title row with a close button, a scrolling body, and an optional footer row split by a rule.
- **Action dock:** lacquer-2 with a rule border (no bottom border) and 16px top corners. A summary line of who and which slots, then the actions. Clue mode swaps in suit tiles, number keys and a full-width primary submit that states the hints left.

### Inputs / Fields
- **Text field:** 48px tall, lacquer fill, 1px rule border, 12px corners, 16px text (avoids zoom on phones).
- **Focus:** border lifts to ink-2. Keyboard focus anywhere also gets the global 2px gofun outline.
- **Switch:** 48 by 28px round track. Off is lacquer-3 with a rule border and an ink-2 knob; on is gofun ink fill and border with a mat knob that slides 20px over 200ms.
- **Segmented choice:** a lacquer track with 4px inset and 12px segments. The chosen segment is filled gofun with mat text; the rest are ink-2.

### Navigation
- **Table header:** sticky, lacquer at 95% with a backdrop blur, rule bottom border, 56px tall plus the top safe-area inset. Left: burst icon and wordmark. Right: eight hint pips (filled ink or ink-3 outline) with the count, three strike slots (a heavy ink X or an empty ring), the deck icon with the count, then the undo and menu icon buttons.

### Selection
Selection is gofun, never a hue.
- **Card selection:** the card lifts 8px and takes a 2px gofun ring offset 3px from the mat, with a round gofun check badge at the top-right corner. Its slot number brightens from ink-3 to ink.
- **Suit tiles:** full-bleed suit fill with the crest in its on-ink and a keyline. Selected takes the 2px gofun ring (offset 2px against the dock or sheet) and scales to 1.05.
- **Number keys:** a selected number key keeps its lacquer fill and gains the gofun ring, black weight and 1.05 scale. It never turns into a white fill, which would read as the white suit tile beside it.
- **Toggles and segments** with no suit neighbours (player count, "You", "Their view", switch on) select with a gofun fill and mat text.

### Ruled-Out Options
Nothing learned is hidden. A ruled-out option stays where it was, quieted and struck through.
- On lacquer and card backs: ink-3 with a strike (a 1.5px diagonal bar across crests, a line-through on numerals).
- On a suit-flooded card: the field's own on-ink at 55% opacity with a 2px line-through.
- Picker options that clues make unlikely drop to 35% but stay tappable.

### The Developing Card (signature)
A 3:5 slab whose type and crests are sized to its own width. Four states:
1. **Back, nothing pinned:** card-back field, double ink frame, a two-column grid of every suit crest (left, in suit ink) and every number (right, in ink), with ruled-out entries struck. Rows follow the longer of the suit and number lists.
2. **Number known:** the numeral prints large at the top in ink. The remaining suit crests run along the bottom.
3. **Color known:** the suit floods the field, its crest prints at the top in the on-ink, and the five numbers run along the bottom with ruled-out ones struck.
4. **Face:** suit field, condensed numeral top-left, crest lower centre.

It flips face-up (420ms, rotating from -90 degrees with a slight scale) only at the moment it becomes fully known, and when a played card lands on a firework. Never on load.

### Suit Crests
Drawn 24px SVG crests in currentColor: plum blossom (five round petals, pierced centre) for red, a twelve-ray chrysanthemum for yellow, a three-tier pine for green, three overlapping seigaiha scales (outlined) for blue, a crescent moon for white.

### Icons
Authored line icons on a 24px grid with 1.75 stroke and round caps and joins, drawn per need (undo, menu, close, check, eye, pencil, arrows, play, discard, clue, deck, notes, plus, burst). Heavier strokes (2.5 to 3) only where an icon stands in for a state mark (strikes, the check badge, error lines).

## Do's and Don'ts

### Do:
- **Do** keep every suit color paired with its crest, and print gofun ink on red, green and blue fields and keyline ink on yellow and white.
- **Do** express selection, danger, strikes, warnings and errors with gofun ink, weight, the 2px ring, strikes and line icons.
- **Do** keep ruled-out options visible: ink-3 and struck through on lacquer, on-ink at 55% and struck through on a suit field.
- **Do** derive the column count of any row that lists suits from the number of suits in play; keep number grids at five.
- **Do** give every card the 1.5px keyline and the card-stock shadow, and size everything inside a card relative to the card's width.
- **Do** keep a selected number key on its lacquer fill with the gofun ring.
- **Do** reserve flip-in for a card becoming fully known or landing on a firework, and burst for a completed firework or a perfect game; slide sheets and the dock in; let reduced motion collapse all of it.
- **Do** use ink-3 for text only on the mat; on lacquer and every raised surface, secondary text is ink-2.

### Don't:
- **Don't** use a suit color, or any red, for UI state; a hue only ever names its suit.
- **Don't** hide a ruled-out option or fade it toward invisibility.
- **Don't** fill a selected number key with white beside the white suit tile.
- **Don't** hard-code five suits into a layout that lists suits.
- **Don't** animate anything on load, and don't add keyframe animations beyond flip-in, burst, sheet-in, dock-in and the scrim fade; other motion stays to short state transitions (press scale, card lift, switch slide).
- **Don't** use emoji, icon fonts or glyph characters for icons or suits; crests and icons are drawn SVG.
- **Don't** give panels, chips or keys the card-stock shadow, and don't tint lacquer furniture with a hue.
- **Don't** introduce a second typeface; hierarchy comes from Archivo's width and weight.
