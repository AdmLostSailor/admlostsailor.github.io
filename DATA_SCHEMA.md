# Terrapin Ouroboros — Data Schema Reference

This document lists **every field** the website reads. As long as your new data uses
these exact field names, types, and the controlled vocabularies noted below, the
existing design renders it with **zero changes**.

There are **3 data files**, all in `data/`. Each is plain JavaScript that assigns one
global object. Keep that wrapper exactly:

```js
window.TERRAPIN_DATA  = { ... };   // data/terrapin_data.js   (the songs + interpretation)
window.TERRAPIN_STATS = { ... };   // data/terrapin_stats.js  (performance numbers, charts, map)
window.TERRAPIN_SHOWS = { ... };   // data/terrapin_setlists.js (setlists behind the map drill-down)
```

Conventions below: `[]` = array, `{}` = object, `?` = optional (page degrades gracefully if absent),
**bold** = required for that feature to work.

---

## ⚠️ Two controlled vocabularies the DESIGN depends on

These two are not free text — the colors, the wheel, and the orientation legend are
hard-coded to these exact strings. If you change the **values**, also tell me and I'll
update the color maps. (Adding/removing songs is fine; it's the *category labels* that are wired.)

### 1. The 9 movement names — exact format `"<ROMAN> - <Name>"`
```
I - Lady With A Fan
II - Terrapin Station
III - At A Siding
IV - Return To Terrapin
V - Ivory Wheels/Rosewood Track
VI - And I Know You
VII - Jack O'Roses
VIII - Leaving Terrapin
IX - Recognition
```
The Roman-numeral prefix is parsed (the wheel strips it for labels and uses position for color).
Order in the `movements` array = order around the circle = color index (0–8).

### 2. The 11 Terrapin orientations — each maps to a fixed color
```
toward Terrapin                      (teal)
returning to Terrapin                (green)
recognizing Terrapin                 (gold)
through Terrapin                     (blue)
reborn after transit                 (cyan)
circling Terrapin without arrival    (violet)
blocked from Terrapin                (lavender-grey)
leaving Terrapin                     (orange)
away from Terrapin                   (coral)
falsely imitating Terrapin           (pink)
destroyed before ascent              (rose-red)
```
Any orientation string not in this list renders in a neutral grey (still works, just uncolored).

---

## File 1 — `data/terrapin_data.js`  →  `window.TERRAPIN_DATA`

### Top-level object
| field | type | notes |
|---|---|---|
| `revision` | string? | free label, shown nowhere critical |
| `generated_at_utc` | string? | informational |
| `source_policy` | string? | informational |
| `song_count` | number? | informational; the site counts `songs.length` itself |
| **`songs`** | `[]` of Song | the heart of everything |
| **`movements`** | `[]` of Movement | the 9 movements (see vocab above) |
| `top_constellations` | `[]` of Constellation? | used by glossary "related songs" |
| `detailed_constellations` | `[]`? | reserved; not required |
| `archetypes` | `[]` of Archetype? | powers archetype hover panels |
| `atu` | `[]` of ATU? | powers ATU (story-family) hover panels |
| `motifs` | `[]` of Motif? | powers motif hover panels |
| `explanations` | `{}`? | glossary definition text (see below) |

### Song object (one per song)  — the most important shape
| field | type | required? | what it drives |
|---|---|---|---|
| **`song_key_norm`** | string | **YES** | the unique ID. lowercase, used for links, stats join, setlist join. MUST be unique and stable. |
| **`display_title`** | string | **YES** | the title shown everywhere |
| **`primary_movements`** | `[string]` | **YES** | which movement(s); value(s) MUST match a movement `name`. First one sets the song's color. |
| **`terrapin_orientations`** | `[string]` | **YES** | orientation pills; values from the 11-item vocab |
| `interpretive_summary` | string? | — | "Interpretive Summary" block |
| `mythic_function` | string? | — | "Mythic Function" block |
| `false_terrapin` | string? | — | left half of the False⟷True diptych |
| `true_terrapin` | string? | — | right half of the diptych |
| `lyrics` | string? | — | full lyrics (use `\n` for line breaks) |
| `lyrics_source` | string? | — | small credit under the lyrics |
| `primary_archetypes` | `[string]`? | — | "Character Archetypes" pills (hoverable) |
| `active_forces` | `[string]`? | — | "Active Forces" pills (hoverable) |
| `atu_list` | `[string]`? | — | "Story Families" pills. Each should start with its ATU number (e.g. `"955 The Robber Bridegroom"`) to link to a description |
| `motif_list` | `[string]`? | — | "Motifs" pills (hoverable) |
| `primary_constellations` | `[string]`? | — | archetype-family membership |
| `constellation_list` | `[string]`? | — | (mirror of above; either is fine) |
| `folklore_classification` | string? | — | small caption above story-families |
| `characters` | `[]` of Character? | — | "Characters" list |
| `character_names` | `[string]`? | — | fallback if `characters` absent |
| `character_count` | number? | — | informational |
| `has_dodd` | boolean? | — | whether Dodd annotations exist |
| `dodd` | Dodd object? | — | the annotation block (see below) |
| `dodd_annotation_count` | number? | — | informational |
| `dodd_images` | `[]` of DoddImage? | — | the image thumbnails / lightbox |
| `shelf_tags` | `[string]`? | — | reserved; not currently shown |

#### Character object (inside `song.characters[]`)
| field | type | notes |
|---|---|---|
| `name` | string | character name |
| `type` | string? | e.g. "named person", "symbolic presence" |
| `archetype` | string? | their archetype label |
| `story_function` | string? | one-sentence role |
| `orientation` | string? | pipe-separated orientations, e.g. `"away from Terrapin \| blocked from Terrapin"` |

#### Dodd object (inside `song.dodd`)
| field | type | notes |
|---|---|---|
| `annotation_count` | number | shown in the header |
| `has_annotation_text` | boolean | |
| `first_posted` / `last_revised` | string? | informational |
| `annotations` | `[]` | each: `{ term:string, text_blocks:[string], blockquotes?:[{text}] }` |

#### DoddImage object (inside `song.dodd_images[]`)
| field | type | notes |
|---|---|---|
| `asset_path` | string | the path the site loads, e.g. `"assets/dodd_image_assets/ophelia.jpg"` |
| `source_reference` | string? | original reference name; used as caption fallback |

### Movement object (inside `movements[]`)
| field | type | notes |
|---|---|---|
| **`name`** | string | one of the 9 names (exact format) |
| `song_count` | number? | informational |
| `songs` | `[]` of `{ key, title }` | members; `key` should equal a song's `song_key_norm` |
| `summary` | `{ meaning: string, ... }`? | shown in the movement hover panel (reads `.meaning`) |

### Archetype object (inside `archetypes[]`)
`{ name: string, song_count: number, song_keys: [string] }` — `song_keys` join on `song_key_norm`.

### ATU object (inside `atu[]`)
`{ name: string, song_count: number, song_keys: [string] }` — `name` typically begins with the ATU number.

### Motif object (inside `motifs[]`)
`{ name: string, song_count: number, songs: [string] }` — note `songs` here holds **display titles**, not keys.

### Constellation object (inside `top_constellations[]`)
`{ name: string, song_count: number, song_keys: [string] }`.

### explanations object
| field | type | notes |
|---|---|---|
| `terrapin_thesis` | string? | the project thesis (About page) |
| `movement_summaries` | `{ "<movement name>": { meaning: string } }`? | movement hover text |
| `atu_descriptions` | `{ "<number>": "<description>" }`? | real ATU tale-type text for hover panels |
| `atu` | string? | one-line "what ATU means" footnote |
| `motif` | string? | one-line "what a motif is" footnote |
| `main_type_motif` | string? | informational |

---

## File 2 — `data/terrapin_stats.js`  →  `window.TERRAPIN_STATS`

Powers the **On Stage** page and the per-song "On Stage" strip. Join key throughout is `song_key_norm`.

| field | type | notes |
|---|---|---|
| **`meta`** | `{}` | `{ shows, venues, cities, states, countries, yearMin, yearMax, distinctSongs, matched, generated }` — all numbers except `generated` (date string) |
| **`songStats`** | `{ "<song_key_norm>": SongStat }` | per-song performance; powers the modal strip |
| **`showsByYear`** | `[[year, count], ...]` | the timeline |
| **`byMovement`** | `[]` | each `{ mv, full, idx, plays, songs, avg }` |
| **`byOrientation`** | `[]` | each `{ ori, plays, songs, avg }` |
| **`topSongs`** | `[]` | each `{ key, title, plays }` — your mythic songs |
| **`topRaw`** | `[]` | each `{ song, plays }` — raw all-time incl. Drums/Space/covers |
| **`rarest`** | `[]` | each `{ key, title, plays }` |
| **`neverPlayed`** | `[string]` | display titles never performed |
| **`cities`** | `[]` | each `{ city, state, country, lat, long, shows }` — the map dots |

#### SongStat object (inside `songStats`)
`{ plays:number, first:year, last:year, opener:number, closer:number, encore:number, rank:number, byYear:[[year,count],...] }`

---

## File 3 — `data/terrapin_setlists.js`  →  `window.TERRAPIN_SHOWS`

Powers the map → city → setlist drill-down. Uses a song dictionary so it stays small.

| field | type | notes |
|---|---|---|
| **`songs`** | `[string]` | the dictionary: every distinct setlist song name. Index into this = the numbers used in `shows[].sets`. |
| **`dictKeys`** | `[string \| null]` | **parallel to `songs`** — `dictKeys[i]` is the `song_key_norm` that `songs[i]` links to, or `null` if it's not one of your project songs. This is the normalization table (Cosmic Charlie→cosmic charley, etc.). |
| **`shows`** | `[]` of Show | every archived show |
| **`byCity`** | `{ "City\|ST\|CC": [showIndex,...] }` | groups shows by city; key is `city\|state\|country`, value is indexes into `shows` |

#### Show object (inside `shows[]`)
`{ d:"YYYY-MM-DD", v:venue, c:city, s:state, k:country, n:songCount, sets:[ [setName, [songIndex,...]], ... ] }`
— the `songIndex` values index into the `songs` dictionary.

---

## The golden rule

**Everything joins on `song_key_norm`.** A song's key in `terrapin_data.js` must match:
- the `key` used in `movements[].songs[]`
- the keys in `archetypes`/`atu`/`top_constellations` `song_keys`
- the keys in `terrapin_stats.js` → `songStats`, `topSongs`, `rarest`
- the non-null entries of `terrapin_setlists.js` → `dictKeys`

Keep that consistent and the whole site — wheel, library, modal, hover panels, stats, map,
setlists — wires itself together automatically.

If you change the **movement names** or the **orientation labels** (the two controlled
vocabularies up top), send me the new lists and I'll update the color maps to match — a
5-minute change. Everything else is yours to fill freely.
