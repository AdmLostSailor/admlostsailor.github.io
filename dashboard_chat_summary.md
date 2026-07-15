# Terrapin Ouroboros — Project Conversation Log

> A running record of the design + build conversation for **The Terrapin Ouroboros**,
> an interactive psychedelic-60s website reading the Grateful Dead songworld as a
> single self-devouring circle. Reconstructed from the working session; earlier
> messages were trimmed for performance, so this is a faithful summary rather than a
> verbatim transcript.

---

## 1. The brief

- **Goal:** Turn an existing dense technical dashboard (an `index.html` + a 3 MB
  `terrapin_data.js`) into a *highly interactive, easy-to-understand* website centered
  on **psychedelic 60s + Grateful Dead iconography**.
- **Important constraint observed throughout:** use the psychedelic-60s *art language*
  (liquid color, sunbursts, tie-dye, kaleidoscopic/mandala layouts, ornate poster
  lettering, turtle & ouroboros motifs) but create **original artwork** — never
  reproduce the band's actual trademarked logos (skull-and-bolt, the specific dancing
  bears, etc.).

### Intake answers that shaped the build
- **Core experience:** a bit of everything with a strong landing "portal" that lets you choose.
- **Visual intensity / palette / type:** explore a few options first.
- **Motion:** lots — breathing/swirling backgrounds, animated transitions, alive.
- **Priority content:** the 9 movements as a narrative arc; Terrapin orientation;
  the mythic interpretation (interpretive summary + mythic function).
- **Scope:** small multi-page site (portal, map, song library, movements, about).
- **Device:** must work great on mobile too.
- **Variations:** yes — show a few directions for portal + map first.
- **Dodd images:** show labeled placeholders until real images provided.

---

## 2. Design directions explored

Built `explorations/Directions.html` on a design canvas: **three cohesive worlds**, each
shown as Portal + Ouroboros Map + Content card.

- **A · Sunset Ramble** — warm Fillmore-poster world (cream paper, hot orange/magenta/gold/teal).
- **B · Liquid Light** — full trip; animated rainbow swirl over black, melting neon wordmark.
- **C · Cosmic Mythos** — refined indigo/violet night, neon accents, elegant serif.

The user leaned toward **Direction A**, then asked for more renditions; the final
chosen direction landed on an **"Eclipse Dawn"** treatment (a refinement combining the
warm poster energy with a darker, cosmic ground).

---

## 3. The site that was built

A small multi-page site sharing `assets/terrapin.css` + `assets/terrapin.js` (+ later
`assets/glossary.js`, `assets/stats-page.js`) and three data files in `data/`.

| Page | Purpose |
|---|---|
| `index.html` | Portal / landing |
| `map.html` | Interactive Ouroboros wheel — 9 movements, song dots, drill-in |
| `songs.html` | Song library with the rich song modal |
| `movements.html` | The nine movements as a narrative arc |
| `stats.html` | **On Stage** — performance statistics + show map (added later) |
| `about.html` | Thesis + the False/True Terrapin essay |

Shared nav, the breathing wheel, animated sky background, and a reduce-motion fallback.

---

## 4. Data work (the long middle of the project)

The dataset is the heart of the project. Major data milestones:

### Charting the songs
- Started at 222 songs; found **2 duplicates** (Minglewood Blues, The Other One) → merged → **220**.
- **20 songs were "orphans"** (no movement/orientation, so no pills). Charted all of them:
  - Recovered real placements where possible; drafted the rest in-voice.
  - Covers + split-suite songs (Weather Report Suite, Let It Grow) handled specially.
- End state: **220 songs, 0 orphans**, every song placed in a movement with orientation pills.

### Dodd annotation images
- 29 songs referenced **40 unique image files**; none were initially included.
- Proved the pipeline by pulling `ophelia.jpg` from Google Drive.
- User attached the **`images` folder**; copied all 40 into `assets/dodd_image_assets/`.
- Modal auto-detects each image by filename and falls back to a dashed placeholder if missing.

### The False / True Terrapin diptych
- The project's deepest interpretive layer: each song has a **False Terrapin** (the
  counterfeit) and **True Terrapin** (the genuine homecoming).
- Source of truth found in the archive: `…/canonical_crosswalk/movement_directionality.csv`.
  (Direct connector pull truncated at ~150 KB — solved by the user attaching the file /
  the source folder so it could be parsed locally.)
- Merged readings into all songs: **202 source-derived**; the remaining **7 drafted**
  in the project's voice (the 5 covers + the 2 suite parts), initially tagged
  "provisional draft."
- Mined `catalog_song_analyses.jsonl` to recover **11 more** authentic readings, leaving
  only 7 genuinely needing drafts.
- At the user's request, the **"provisional" markers were removed** — all 220 now present
  the diptych as canon.
- The About page carries a **"False Terrapin, True Terrapin" essay**.

### Statistics layer (the "On Stage" work)
- Distilled a 12 MB setlist archive into a compact **`data/terrapin_stats.js`** (~84 KB).
- **Per-song "On Stage" strip** in the modal: times played, years live, rarity rank,
  opener/closer/encore counts, and a per-year sparkline (tinted to movement color).
- **`stats.html` page:** big-number band (2,327 shows · 1965–2015 · 588 venues · 312
  cities · 12 countries · 435 songs), shows-by-year timeline, most-played (mythic vs raw
  toggle), plays-by-movement and plays-by-orientation bar charts with a poetic callout
  ("circling Terrapin without arrival" is the most-performed orientation), and a
  **psychedelic show-map** of 312 cities.

---

## 5. The song modal — interactive upgrades

A large feature pass on `songs.html`'s modal:

1. **Columns swapped** — lyrics + Dodd annotations on the **left**, interpretation
   (summary, mythic function, diptych, directionality, archetypes, forces, story
   families) on the **right**.
2. **Full lyrics, no inner scroll** — the lyrics panel expands to full height.
3. **Image lightbox** — click any Dodd image to see it large; Esc / backdrop / ✕ closes.
4. **Hover info panels on every pill** (via new `assets/glossary.js`):
   - **False/True Terrapin boxes** → definition of each pole.
   - **Directionality** (movements + orientations) → meaning + other songs that share it.
   - **Character Archetypes** → archetype-family definition + famous non-Dead parallels
     ("Echoes in… Iago, Loki, the suitors of Penelope") + related songs.
   - **Active Forces** → whether the force pulls toward False or True Terrapin + related songs.
   - **Story Families (ATU)** → real Aarne–Thompson–Uther descriptions + related songs.
   - **Motifs** → folklore gloss + related songs.
   - Related-song chips inside panels are **clickable** (open that song).
- **Bug fixed:** hover panels were rendering *behind* the modal (z-index 900 < 1000) —
  lifted info panel to 1200, lightbox to 1400.

---

## 6. The show map (stats page)

- Originally plotted dots with a hand-rolled projection over **hand-traced continent
  outlines** — judged too crude.
- Replaced with a **real Leaflet map** using dark CARTO tiles; 312 city dots sized by
  show count, colored across a spectrum, with tooltips, zoom, and proper OSM/CARTO
  attribution. (Live tiles need an internet connection; dots/drawer/setlists work offline.)
- **Drill-downs added:**
  - **Map → city → setlist:** click a city → right-side drawer lists every archived show
    (date + venue + song count) → click a show to expand its **full setlist**; project
    songs are clickable links to their modal. Backed by compact **`data/terrapin_setlists.js`**
    (0.39 MB, 2,032 shows, song-dictionary compressed).
  - **Bars → ranked breakdowns:** click a movement/orientation bar to expand its songs
    ranked by play count; click again to collapse.
- **Hit-target fix:** tiny one-show city dots were nearly impossible to click. Added an
  invisible ~13px hit circle over every dot + pointer cursor — same look, easy clicks.

### Setlist song-name normalization
- Setlist names came from a different source than project titles, so spelling variants
  failed to link (the reported **"Cosmic Charlie" vs "Cosmic Charley"** bug).
- Ran a normalization scan: 197/435 matched exactly; recovered **21 more** variants
  (Rubin and Cherise → Reuben And Cerise, Rosa Lee McFall → Rosalie McFall, My Brother
  Esau → Brother Esau, etc.) → **218 linked**.
- Built-in safeguards: a **number-word guard** (blocks "The Seven" ↔ "The Eleven"
  false-match) and a **precomputed `dictKeys` table** baked into the data (deterministic,
  fast, auditable).
- Only **France** and **Pride of Cucamonga** remain unlinked — correct (studio-only,
  never performed live).

---

## 7. Archetype-family data (discussed)

- Confirmed **every song already carries archetype-family membership** in
  `primary_constellations` — 202 of 220 (same 18 orphans/covers blank).
- The 7 real families by song count: Broken Pilgrims and Departing Communities (157),
  False Terrapin Figures (123), Storyteller / Fire / Recognition (106), Train / Track /
  Return (96), Recognition Lovers (91), Fan / Beloved / Venus (66), Sailor / Jack /
  Returning Lover (12).
- Noted a small **data bug**: 9 songs have garbage "family" values (False/True Terrapin
  prose mis-parsed into the constellation field) — flagged for cleanup, not yet cleaned.
- Surfacing families in the modal / a "Cast of the Songworld" page = available, no new
  data work needed.

---

## 8. Reference docs created for data regeneration

The user plans to **redo the data/analysis while keeping the design identical**. To
support that, three reference files were written:

- **`FIELD_GUIDE.md`** — plain-language list of every field + its purpose.
- **`DATA_SCHEMA.md`** — exact technical spec: types, structure, the two controlled
  vocabularies (9 movement names, 11 orientations), and the golden join-key rule
  (everything joins on `song_key_norm`).
- **`GENERATION_PROMPT.md`** — a model-agnostic SYSTEM prompt + per-song USER template
  that returns schema-perfect JSON, with validation notes for the user's script.

**Model recommendation given:** the interpretive synthesis (summary, mythic function,
False/True diptych) is exactly the nuanced humanities work where Claude tends to be
strongest; the structural/tagging fields are easy for either Claude or ChatGPT. Prompt
written to be portable across both. Also offered: a deterministic **reducer script** that
rebuilds `movements[]`, `archetypes[]`, `atu[]`, `motifs[]`, `top_constellations[]` from
the per-song tags (no LLM needed) — not yet built.

---

## 9. File map (as of this log)

```
index.html              Portal
map.html                Ouroboros wheel
songs.html              Song library + rich modal
movements.html          The nine movements
stats.html              On Stage (performance stats + show map)
about.html              Thesis + False/True Terrapin essay

assets/
  terrapin.css          Shared styling
  terrapin.js           Shared runtime (nav, wheel, song modal, hover panels, lightbox)
  glossary.js           Definitions + related-song engine for hover panels
  stats-page.js         On Stage page logic + map + drill-downs
  dodd_image_assets/    40 Dodd annotation images

data/
  terrapin_data.js      220 songs + movements + archetypes + interpretation
  terrapin_stats.js     Performance numbers, charts, map dots (~84 KB)
  terrapin_setlists.js  Setlists behind the map drill-down (~0.39 MB)

DATA_SCHEMA.md          Full technical schema
FIELD_GUIDE.md          Plain-language field list
GENERATION_PROMPT.md    LLM prompt for regenerating song data
dashboard_chat.md       This log
```

---

## 10. Open / offered next steps

- Clean the 9 corrupted `primary_constellations` entries.
- Surface archetype families in the modal (hover panels) and/or build a
  "Cast of the Songworld" page.
- Build the deterministic **reducer script** for the regeneration pipeline.
- Optional: drawer search (jump to date/venue); make most-played bars expand inline;
  a song-editing "edit mode" for writing the larger book project; era-colored or
  year-animated show map; standalone offline export.

---

*This project is one part of a larger book project. The website's design (the "shell")
and its data are cleanly separated — the data files can be regenerated and dropped in
without touching the design, provided they keep the field names and the two controlled
vocabularies documented in `DATA_SCHEMA.md`.*
