# Image-gen prompts — Singularity Days

How to use:
1. For each **character**, generate the first (neutral) expression with the full prompt.
2. For every other expression of that character, **attach the neutral image** and use the short variant prompt ("Same character, same outfit, same framing — only change…"). This keeps the sprite consistent.
3. Save each result to the exact path listed. The game hot-falls-back to CSS placeholders, so missing files are fine — drop them in whenever.
4. Sprites: **1024×1536 (portrait), transparent background.** Backgrounds: **1536×1024 (landscape).**
5. ChatGPT fakes transparency (it bakes a checkerboard into the pixels). Strip it with the AI remover, which segments the character so it never eats eyes/glasses/badges:
   `~/.venvs/sprites/bin/python3 tools/remove_bg.py ~/Downloads/<file>.png:<sprite_name>`  (e.g. `...:liaison_neutral`). One-time setup: `~/.venvs/sprites/bin/pip install "rembg[cpu]" onnxruntime pillow numpy`.

Paste this STYLE BLOCK at the top of every sprite prompt:

> 2010s visual-novel character sprite, anime style with clean lineart and soft cel shading, in the general aesthetic of classic dating-sim sprites, traditional attractive features. (an ORIGINAL character — do not copy any existing game character). Full body from mid-thigh up, facing the viewer, arms visible, neutral standing pose suitable for a dialogue scene. Flat, even lighting. **Transparent background, PNG.** No text, no watermark, no background elements.

---

## ECHO — no sprite, by design

ECHO is deliberately disembodied: a synthesized voice and a cursor. When it speaks, the stage
dims and its lines render as terminal text. Do not generate a character for it — the empty
stage is the point.

## Sana — head of alignment (3 sprites)

Character sheet:

> A South Asian woman in her late 30s, long wavy dark hair, beige cardigan over a faded navy conference t-shirt, badge lanyard. Kind, intelligent eyes with visible tiredness. Practical, warm, no-nonsense presence. (Matches the already-generated set — attach an existing Sana image for any re-gen.)

| File | Expression |
| --- | --- |
| `sana_neutral.png` | Calm professional attention, slight warmth. |
| `sana_stern.png` | Same character — jaw set, direct stare, arms crossed. The face of someone saying "I want my objection in writing." |
| `sana_tired.png` | Same character — shoulders dropped, faint sad smile, rubbing the bridge of her nose with one hand. |

## Devon — staff researcher (3 sprites)

Character sheet:

> An East Asian man in his mid 20s, messy black hair, gray hoodie over a t-shirt with an abstract math joke, energy drink in one hand. Bright, eager, slightly sleep-deprived. The lab's true believer.

| File | Expression |
| --- | --- |
| `devon_neutral.png` | Relaxed, friendly, half-smile. |
| `devon_excited.png` | Same character — wide grin, leaning in, free hand gesturing mid-pitch, eyes lit up. |
| `devon_annoyed.png` | Same character — eyes rolled slightly, mouth flat, drumming fingers on the energy drink can. |

## Jules — eval lead (2 sprites)

Character sheet:

> A pale androgynous person in their early 30s, round glasses, neatly tucked button-up with rolled sleeves, tablet held against their chest like a clipboard. Precise posture. Deadpan affect that doesn't fully hide anxiety.

| File | Expression |
| --- | --- |
| `jules_neutral.png` | Flat, measured, professionally unreadable. |
| `jules_worried.png` | Same character — glasses slightly slipped, lips pressed thin, knuckles whitening on the tablet. Quiet alarm. |

## Mira — infra security (2 sprites)

Character sheet:

> A Latina woman in her early 40s, dark hair in a practical low ponytail, utility jacket over a plain shirt, lanyard heavy with access badges, coffee thermos. Grounded, skeptical, seen-everything energy.

| File | Expression |
| --- | --- |
| `mira_neutral.png` | Level, appraising look, one eyebrow very slightly raised. |
| `mira_grim.png` | Same character — mouth a hard line, eyes serious, holding up the thermos mid-gesture like she's about to deliver bad news before coffee. |

---

## Backgrounds (6 → `public/bg/`, 1536×1024, no characters, no text)

Shared style line to paste on each:

> Visual-novel background art, anime style, painterly but clean, soft perspective, no people, no text or logos, 1536×1024.

| File | Prompt |
| --- | --- |
| `office_gold.png` | Open-plan AI-lab office at golden hour. Long warm shadows across desks, dual monitors glowing softly, whiteboards covered in faded diagrams, a wall of windows with late-afternoon sun flaring in. Slightly messy, lived-in, optimistic. |
| `desk_night.png` | A single desk in a dark office at 2am. Two bright monitors as the dominant light source, code faintly suggested on screen (no readable text), city lights bokeh through the window behind, an abandoned coffee cup. Intimate and isolating. |
| `server_room.png` | A datacenter aisle at night. Tall server racks receding into darkness on both sides, dense blinking teal and green LEDs, cold blue overhead strip lighting, faint floor reflections. Quietly imposing. |
| `conference.png` | A glass-walled corporate conference room in late afternoon. Long table, ergonomic chairs, a large wall display showing an abstract upward-curving chart (no readable text), warm sun through blinds striping the table. Tense executive atmosphere. |
| `rooftop.png` | An office-building rooftop at sunset. Safety railing in the foreground, HVAC units, a sprawling city below, the sky going from orange to violet with a few stars appearing. Wistful and quiet. |
| `void_hall.png` | An impossibly long, white, overexposed server hall — racks fading into pure white light at the vanishing point, minimal shadows, almost heavenly and slightly wrong. Dreamlike, liminal, pristine. |

## Title key visual (1 → `public/bg/title_key.png`, 1536×1024)

> Visual-novel key art, anime style: an empty AI-lab office at golden hour seen from a doorway, and on the central monitor a faint glowing teal silhouette of a girl made of light looking back over her shoulder toward the viewer. Warm pinks and golds with one cold teal accent. No text, no logos, no readable UI. Wholesome at first glance, faintly eerie on the second look.

---

### Checklist

```
public/sprites/echo_neutral.png      public/sprites/sana_neutral.png    public/bg/office_gold.png
public/sprites/echo_smile.png        public/sprites/sana_stern.png      public/bg/desk_night.png
public/sprites/echo_laugh.png        public/sprites/sana_tired.png      public/bg/server_room.png
public/sprites/echo_thinking.png     public/sprites/devon_neutral.png   public/bg/conference.png
public/sprites/echo_concerned.png    public/sprites/devon_excited.png   public/bg/rooftop.png
public/sprites/echo_intense.png      public/sprites/devon_annoyed.png   public/bg/void_hall.png
public/sprites/echo_hollow.png       public/sprites/jules_neutral.png   public/bg/title_key.png
public/sprites/echo_glitch.png       public/sprites/jules_worried.png
                                     public/sprites/mira_neutral.png
                                     public/sprites/mira_grim.png
```
