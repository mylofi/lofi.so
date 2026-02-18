# lofi.so Web Rewrite Plan

## Scope
This plan targets the five core features:
1. Directory listing for apps, products, solutions, platforms, and databases.
2. Event graphic route that generates PNGs and updates homepage meetup content.
3. Sponsorship rails (right rail and footer).
4. Links to people and articles.
5. Dedicated detail UI for each listing.

## What I reviewed
- Live routes via local screenshots: `/`, `/directory`, `/event-graphic`, `/mentions`, `/directory/apps/actual`, `/directory/projects/electricsql`.
- Key implementation files:
  - `src/routes/+page.svelte`
  - `src/lib/components/SponsorsRail.svelte`
  - `src/lib/components/Footer.svelte`
  - `src/routes/event-graphic/+page.svelte`
  - `src/lib/components/EventGraphic.svelte`
  - `src/lib/components/SpeakerCard.svelte`
  - `src/routes/directory/+layout.svelte`
  - `src/routes/directory/+page.svelte`
  - `src/routes/directory/apps/[slug]/+page.svelte`
  - `src/routes/directory/projects/[slug]/+page.svelte`
  - `src/routes/mentions/+page.svelte`
  - `src/lib/utils/date.ts`

## Current issues to fix first

### UX and visual issues
- Homepage hierarchy is weak on mobile; many sections feel visually similar.
- Sponsorship rails are critical but logos are visually muted (grayscale + low contrast), reducing sponsor visibility.
- Detail pages for apps/projects are sparse and do not feel like dedicated "store listing" pages.
- Event graphic style feels dense and dated relative to the rest of the product.

### Functional bugs
- Off-by-one day bug in speaker cards:
  - `src/lib/components/SpeakerCard.svelte:16`
  - Uses `new Date(date)` on `YYYY-MM-DD`, which can shift day by timezone.
- Potential off-by-one in default event date:
  - `src/routes/event-graphic/+page.svelte:16`
  - Uses `toISOString().split('T')[0]` when computing last Tuesday.

## Rewrite goals
- Make lofi.so feel like a curated local-first discovery product, not just a list of links.
- Increase sponsor visibility and click intent without harming content UX.
- Upgrade event graphics to a more modern and shareable visual language.
- Eliminate date/time correctness issues in all event surfaces.
- Standardize listing detail pages into reusable templates with richer metadata.

## Design direction options (choose 1 primary, keep others as fallback)

### Direction A: Signal
- Clean editorial cards, sharp spacing, high contrast.
- Palette:
  - `--brand: #4C62FF`
  - `--accent: #FFB21D`
  - `--ink: #101828`
  - `--paper: #F8FAFC`
- Best for directory legibility and sponsor trust.

### Direction B: Gridline
- Technical, blueprint-like backgrounds, strong section boundaries.
- Palette:
  - `--brand: #2C55E8`
  - `--accent: #12B981`
  - `--ink: #0B1220`
  - `--paper: #EEF2FF`
- Best for "platform/tools/database" framing.

### Direction C: Poster
- Bolder gradients and event-forward visual style.
- Palette:
  - `--brand: #3E54FF`
  - `--accent: #FF8A00`
  - `--ink: #0F172A`
  - `--paper: #F8FAFC`
- Best for social graphic output.

## Proposed information architecture

### Homepage (`src/routes/+page.svelte`)
- Hero with stronger value statement and dual CTA:
  - `Browse Directory`
  - `Join Next Meetup`
- Move "Directory" section higher above Learn/Feed on mobile.
- Keep sticky right rail on desktop, convert to compact sponsor strip on smaller breakpoints.

### Directory (`src/routes/directory/*`)
- Preserve left nav, but improve scan speed:
  - denser cards
  - better category chips
  - count indicators
- Add clear content-type badges: App, Project, Platform, Database, Library.
- Add sort options: Featured, Newest, A-Z.

### Detail pages (`src/routes/directory/apps/[slug]/+page.svelte`, `src/routes/directory/projects/[slug]/+page.svelte`)
- Convert to "store listing" layout:
  - hero summary
  - quick facts block
  - screenshots/logo area
  - related tools
  - sticky external CTA
- Keep prev/next navigation but add "Back to filtered results" behavior.

### Mentions and people (`src/routes/mentions/+page.svelte`)
- Separate "Articles", "Videos", "People to Follow" into tabbed or segmented blocks.
- Normalize card heights and metadata treatment.
- Add "Last updated" and source badges.

## Sponsorship rails redesign

### Right rail (`src/lib/components/SponsorsRail.svelte`)
- Remove default grayscale for active sponsor logos.
- Add tier-based card treatments (Partner > Platinum > Gold).
- Keep meetup module pinned at top, sponsor block immediately below with clear "Sponsored" label.
- Improve mobile fallback so sponsorship is visible without sidebar.

### Footer (`src/lib/components/Footer.svelte`)
- Keep sponsor logos full color by default.
- Introduce clear sponsorship CTA:
  - `Become a sponsor`
- Keep contribution links secondary.

## Event graphics generator upgrade

### Generator UX (`src/routes/event-graphic/+page.svelte`)
- Split into workspace:
  - left: structured form tabs (Event, Speakers, Links, Style)
  - right: live preview with zoom presets (100%, 75%, mobile crop)
- Add style presets and remember last used preset.
- Add validations:
  - missing speaker avatar fallback
  - overlong title/talk guardrails

### Graphic output (`src/lib/components/EventGraphic.svelte`, `src/lib/components/SpeakerCard.svelte`)
- Create three exportable templates:
  - `Classic` (safe, clean)
  - `Spotlight` (speaker-forward)
  - `Agenda` (multi-talk emphasis)
- Improve typography scale and whitespace.
- Improve CTA hierarchy:
  - primary action in strong color
  - secondary actions neutral
- Add consistent sponsor lockup area and spacing grid.

### Date/time correctness fixes
- Replace date parsing with timezone-safe helpers:
  - Use `parseYMDAsLocalDate` style logic everywhere date-only values are displayed.
- Fix in:
  - `src/lib/components/SpeakerCard.svelte`
  - `src/routes/event-graphic/+page.svelte`
  - any fallback `new Date(eventData.date)` usage in banner/rails/components.

## Implementation phases

### Phase 1: Foundation and bug fixes (1 sprint)
- Build design tokens (colors, spacing, elevation, radii) in `src/app.css` and `tailwind.config.ts`.
- Fix all date off-by-one issues.
- Add regression tests for date formatting and event rendering.

### Phase 2: Directory and detail templates (1 sprint)
- Rework directory cards and filters.
- Rebuild app/project detail templates.
- Add content-type badges and richer metadata sections.

### Phase 3: Sponsorship rails and mentions (1 sprint)
- Redesign right rail and footer sponsorship modules.
- Improve mentions and people/article blocks for readability and consistency.

### Phase 4: Event graphics system (1 to 2 sprints)
- Rebuild generator UI with style presets.
- Implement three template variants.
- Improve export consistency for PNGs (1120x630 and speaker cards).

## Acceptance criteria
- No off-by-one day errors across event UI and exports.
- Sponsor logos are clearly visible and measurable via CTR increase.
- Directory cards and detail pages are visually distinct and easier to scan.
- Event graphics are modern, legible, and reusable across platforms.
- Mobile and desktop layouts both maintain hierarchy and sponsor visibility.

## Suggested metrics
- Sponsor link CTR (right rail, footer).
- Directory click-through rate to detail pages.
- Detail page outbound clicks to listed products.
- Event graphic generation success rate and time to first export.
- Bounce rate change on homepage and directory.

## Delivery note
If you want, I can execute this plan starting with Phase 1 immediately: date bug fixes + visual token cleanup + first sponsorship rail pass.
