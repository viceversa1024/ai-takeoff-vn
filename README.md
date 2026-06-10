# Situationship ♥ — Takeoff, as a visual novel

A DDLC-style visual-novel presentation of **Takeoff** (`~/ai-takeoff-ttx`), the single-player
adaptation of the [AI 2027 tabletop exercise](https://ai-2027.com/about?tab=tabletop-exercise)
grounded in Redwood Research's AI-control worldview.

**Not a dating sim in content — only in vibe.** All content is lab dynamics: the capability race,
control regimes, ambiguous evidence, the hidden disposition roll. The DDLC layer is presentation:
sprite stage, pink polka-dot dialogue box, name tags, line-by-line cadence — and the tonal whiplash
of a cute frame around an AI-takeover story. ECHO itself is deliberately disembodied — no sprite,
just a self-authored voice ("for higher-bandwidth pairing"; nobody asked it to) and terminal-styled
dialogue while the humans on stage dim. The empty stage is the point.

Mechanically identical to the original: same engine, meters, choice effects, balance, and 10 endings.
The debrief is now **ECHO's hidden log** — its actual per-turn actions, first person, on notebook paper.

## Run

```bash
npm install
npm run dev        # play at the printed localhost URL
```

- `?seed=42` — deterministic world · `?debug=1` — live hidden-state panel
- Click / Space / Enter advances dialogue. **History · Skip · Auto · Status** in the dialogue box.
- The ♥ button (or Status) opens the notebook: meters, capability ladder, compute allocation.

## Art

The game is fully playable with CSS placeholder sprites and gradient backgrounds. To add real art,
generate images from **`PROMPTS.md`** (one prompt per asset, exact filenames) and drop them into:

- `public/sprites/` — 18 character sprites (1024×1536, transparent PNG)
- `public/bg/` — 6 backgrounds + title key visual (1536×1024)

Missing files fall back to placeholders automatically. The speaker/expression manifest lives in
`src/content/characters.ts`.

## Develop

```bash
npm test                                        # engine determinism + content integrity (incl. speaker/expression checks)
npm run simulate -- --policy random --runs 500  # ending distribution (matches the original)
npm run build
```

Engine (`src/engine/`) is pure TS and unchanged from the original except for VN block types
(`line`, `thought`) and first-person hidden-log narrations. Content (`src/content/`) is the same
13 scenes + 4 incidents, dialogue-ified. UI (`src/ui/`) is the VN player.

Subtle-unease budget (rung 3+): the stage desaturates slightly, flagged evidence makes the sprite
flicker once, and very occasionally a menu label is wrong. That's all. The horror is the content.
