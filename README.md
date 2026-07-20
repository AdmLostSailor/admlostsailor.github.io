# The Terrapin Ouroboros Project

An interpretive atlas of the Grateful Dead songworld, read as a single circle orbiting one still center: **Terrapin**. Every song is placed by which of the 13 movements of the *Terrapin* suite it belongs to, and by its directionality — toward, within, away, ambiguous, or instrumental — relative to that center.

## Pages

- **`index.html`** — Portal / landing page.
- **`map.html`** — The Ouroboros Map, a geographic/visual overview.
- **`songs.html`** — Song Library: browse and search every song, open a full profile modal (summary, mythic function, false/true Terrapin, characters, folklore tags, Dodd annotations, lyrics, live stats).
- **`movements.html`** — The Terrapin Suite: the 9 movements (I–IX) and their member songs.
- **`compass.html`** — The Compass: a radial instrument plotting every song by movement (heading) and directionality (distance from the hub), with search/filter and click-through to the full profile.
- **`cast.html`** — The Cast: characters and archetypes across the songworld.
- **`segues.html`** — Segues between songs.
- **`stats.html`** — On Stage: live performance statistics (play counts, timeline, rarest/most-played, city map).
- **`about.html`** — Project background.

## Structure

- **`assets/terrapin.css`** — shared "Eclipse Dawn" design system (colors, type, components) used across all pages.
- **`assets/terrapin.js`** — shared runtime: data helpers, movement/orientation color + label lookups, song modal, nav.
- **`data/terrapin_data.js`** — the core dataset (`TERRAPIN_DATA`): songs, movements, archetypes, ATU/motif cross-references, explanations.
- **`data/terrapin_stats.js`** — live performance stats (`TERRAPIN_STATS`).
- Setlist data (`TERRAPIN_SHOWS`) powers the map/stats drill-downs.

## Data model

See **`FIELD_GUIDE.md`** for a plain-language tour of every field and what it's for, **`DATA_SCHEMA.md`** for the exact structure/types the pages read.

The one rule tying it all together: **every file joins on `song_key_norm`**, the stable unique ID for a song.
