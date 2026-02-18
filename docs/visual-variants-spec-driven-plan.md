# lofi.so Visual Variants Plan (Spec-Driven, Tailwind-First)

## 1. Objective
Create three visual variants for lofi.so that can be built via spec-driven development and generated in one pass without ambiguous design decisions.

The system must prioritize:
- Responsive behavior from mobile-first to desktop.
- Tailwind-only UI formatting patterns (utility-first classes, no component CSS frameworks).
- Strong support for the five critical features:
  - directory discovery
  - event graphic generation route
  - sponsor rails (right rail + footer)
  - people/articles links
  - dedicated listing detail pages

## 2. Shared Constraints
- Framework: existing SvelteKit + Tailwind.
- Keep route structure unchanged unless explicitly needed.
- Keep data sources unchanged (`content.json`, directory JSON files, sponsors, mentions).
- Visual variants must not break dark mode.
- Export dimensions for graphics remain:
  - event card: `1120x630`
  - speaker card: `800x450`

## 3. Variant Catalog

### Variant 1: Signal (implement first)
Intent:
- Editorial, high legibility, “trustworthy index” feel.
- Strong information hierarchy and cleaner sponsor visibility.

Token direction:
- `primary`: `#4C62FF`
- `accent`: `#FFB21D`
- `ink`: slate-900 family
- `paper`: slate-50 family

Layout direction:
- Section cards with light surface tint and subtle border separation.
- Strong CTA bars and clearer heading groups.
- Sponsor logos full-color by default.

### Variant 2: Gridline
Intent:
- Technical, systems-oriented, blueprint-inspired.

Token direction:
- `primary`: `#2C55E8`
- `accent`: `#12B981`
- more neutral cool grays.

Layout direction:
- Structured panel grids.
- Strong side rails and tabular rhythm.
- Category chips + dense data cards.

### Variant 3: Poster
Intent:
- Event-forward and social-share-first.

Token direction:
- `primary`: `#3E54FF`
- `accent`: `#FF8A00`
- higher contrast hero and CTA blocks.

Layout direction:
- Bold hero composition and spotlight modules.
- Larger typography scale on promo/event surfaces.
- Strong gradient treatments for event artifacts.

## 4. Responsive Spec (all variants)

### Breakpoints
- `xs` (`>=470px`)
- `sm` (`>=640px`)
- `md` (`>=768px`)
- `lg` (`>=1024px`)
- `xl` (`>=1280px`)

### Home Page
- Mobile (`<md`):
  - Single-column flow.
  - Sponsor rail collapses to compact horizontal cards.
  - Event block appears before learn/feed cards.
- Tablet (`md-lg`):
  - Two-column cards where possible.
  - Sticky section headings remain but with reduced offset.
- Desktop (`>=xl`):
  - Main content with right sponsor rail (`19.5rem`).
  - Sticky rail with meetup + sponsor stack.

### Directory
- Mobile:
  - Sidebar hidden.
  - Filter chips wrap to multi-line.
  - Cards full width.
- Tablet:
  - 2-column cards.
- Desktop:
  - Left directory nav + optional right sponsor rail.
  - 3-column card grid.

### Event Graphic Route
- Mobile:
  - Form and previews stack vertically.
  - Preview wrappers scroll horizontally.
- Desktop:
  - 2-column form groups.
  - Persistent preview blocks below controls.

## 5. Component Contract Matrix

### `Hero`
- Must include:
  - primary value proposition
  - two to three primary CTAs
  - visual background structure (gradient/grid/noise)
- Must remain readable at `320px`.

### `SponsorsRail`
- Must include:
  - meetup panel
  - conferences panel
  - sponsor cards with visible logos
- Right rail sticky behavior only on desktop.

### `Footer`
- Must include:
  - sponsor logo strip
  - “contribute” action links
- No grayscale-by-default logos in Variant 1.

### `Directory list + details`
- Must include:
  - search + category filters
  - listing cards with clear title/description
  - dedicated detail hero and related metadata.

### `EventGraphic + SpeakerCard`
- Must include:
  - clear title/date/time block
  - speaker rows
  - sponsor lockup
  - CTA cluster.

## 6. Data and Behavior Spec
- Off-by-one date prevention:
  - Never use `toISOString().split('T')[0]` for local date defaults.
  - Never use `new Date('YYYY-MM-DD')` for local display formatting.
- Event date display should use local Y-M-D parsing utilities.
- `startTimeISO` remains source of truth when present.

## 7. One-Shot Generation Packet (per variant)
Use this execution structure for deterministic implementation:

1. Define variant tokens in `tailwind.config.ts` and optional CSS variables in `src/app.css`.
2. Apply surface and spacing primitives:
   - section wrapper classes
   - heading classes
   - card classes
   - CTA classes
3. Apply responsive behavior:
   - mobile-first card grids
   - right rail display constraints
4. Apply sponsor treatment:
   - visible logo contrast
   - sponsor hierarchy labels
5. Apply event graphics treatment:
   - updated color and typography rhythm
   - date correctness fixes
6. Verify pages:
   - `/`
   - `/directory`
   - `/directory/apps/[slug]`
   - `/directory/projects/[slug]`
   - `/mentions`
   - `/event-graphic`

## 8. Acceptance Criteria (variant complete)
- All target routes render without layout breakage at mobile and desktop widths.
- Sponsor visibility improves (no forced low-contrast grayscale in default state).
- Directory and detail pages clearly feel like dedicated listing UIs.
- Event graphic route UI is visually improved and date-safe.
- Tailwind class usage remains dominant; custom CSS is limited to small shared primitives only.

## 9. Implementation Order
1. Variant plan docs (this file).
2. Implement Variant 1 (`Signal`) on core routes/components.
3. Capture screenshots and adjust spacing/contrast.
4. Derive Variant 2 and Variant 3 from same component contract.
