# Terrapin Ouroboros — Field Guide (names + purpose)

A plain-language list of every field and what it's *for*. For exact types/structure,
see `DATA_SCHEMA.md`. For generating the data with an LLM, see `GENERATION_PROMPT.md`.

## Song fields — `TERRAPIN_DATA.songs[]`

### Identity & placement (required)
- **`song_key_norm`** — the unique ID for the song (lowercase). Every other file links to this. Must be unique & never change once set.
- **`display_title`** — the human title shown everywhere.
- **`primary_movements`** — which of the 9 movements the song belongs to. First entry sets the song's color.
- **`terrapin_orientations`** — which of the 11 directions toward/around/away from Terrapin the song embodies. Drives the colored pills.

### Interpretive prose (the writing)
- `interpretive_summary` — the main reading of the song: what it's doing in the songworld.
- `mythic_function` — the deeper mythic/ritual role the song performs.
- `false_terrapin` — the counterfeit the song mistakes for home (left side of the diptych).
- `true_terrapin` — the genuine homecoming the counterfeit imitates (right side of the diptych).

### Lyrics
- `lyrics` — the full lyrics (line breaks as `\n`).
- `lyrics_source` — small credit line under the lyrics.

### Classification pills (each is hover-enabled on the page)
- `primary_archetypes` — the character archetypes at play ("Broken pilgrim," "The false beloved"…).
- `active_forces` — the forces driving the song ("outlaw flight," "communal judgment"…).
- `atu_list` — folklore story-families (Aarne–Thompson–Uther). Start each with its ATU number.
- `motif_list` — recurring folklore motifs ("blues lament," "fugitive flight"…).
- `primary_constellations` / `constellation_list` — the archetype-family memberships.
- `folklore_classification` — a short caption summarizing the folklore tags.

### Characters
- `characters` — the cast: each with `name`, `type`, `archetype`, `story_function`, `orientation`.
- `character_names` — simple name list (fallback if `characters` is absent).
- `character_count` — how many characters (informational).

### David Dodd annotations
- `has_dodd` — whether annotations exist.
- `dodd` — the annotation block: a count plus `annotations[]`, each `{ term, text_blocks[], blockquotes[] }`.
- `dodd_annotation_count` — count (informational).
- `dodd_images` — referenced images: each `{ asset_path, source_reference }`. Shown as thumbnails + lightbox.

### Reserved
- `shelf_tags` — extra tags; not currently displayed.

## Movement fields — `TERRAPIN_DATA.movements[]`
- **`name`** — one of the 9 movement names (exact `"<Roman> - <Name>"` format).
- `song_count` — informational.
- `songs` — member songs as `{ key, title }` (key = a song's `song_key_norm`).
- `summary.meaning` — the movement's description, shown in its hover panel.

## Cross-reference lists (drive the hover panels' "related songs")
- `archetypes[]` — `{ name, song_count, song_keys[] }`.
- `atu[]` — `{ name, song_count, song_keys[] }` (name starts with the ATU number).
- `motifs[]` — `{ name, song_count, songs[] }` (here `songs` holds display titles).
- `top_constellations[]` — `{ name, song_count, song_keys[] }`.
- `explanations` — definition text: `terrapin_thesis`, `movement_summaries`, `atu_descriptions`, plus one-line `atu`/`motif` footnotes.

## Performance stats — `TERRAPIN_STATS`
- `meta` — totals: shows, venues, cities, states, countries, year range, distinct songs.
- `songStats["<key>"]` — per song: `plays, first, last, opener, closer, encore, rank, byYear[]`. Powers the modal's "On Stage" strip.
- `showsByYear` — the career timeline.
- `byMovement` / `byOrientation` — plays aggregated by movement / orientation (the bar charts).
- `topSongs` / `topRaw` — most-played (mythic / raw-including-Drums).
- `rarest` — least-played mythic songs.
- `neverPlayed` — titles never performed live.
- `cities` — map dots: `{ city, state, country, lat, long, shows }`.

## Setlists — `TERRAPIN_SHOWS`
- `songs` — dictionary of every setlist song name (indexed by number).
- `dictKeys` — parallel array linking each dictionary name to a `song_key_norm` (or `null`). The normalization table.
- `shows` — every show: `{ d, v, c, s, k, n, sets[] }` where `sets` reference the song dictionary by index.
- `byCity` — `{ "City|ST|CC": [show indexes] }` for the map drill-down.

## The one rule that ties it together
**Everything joins on `song_key_norm`.** Keep that ID consistent across all files and the
whole site assembles itself.
