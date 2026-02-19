# Event Graphic Generator System Upgrade Plan

## 1. Goal
Upgrade `/event-graphic` into a spec-driven system that can generate social-ready assets for X, Bluesky, and Discord in one pass, while using the same event data to power the homepage Meetup UI (Join section + banner + rail) and clearly highlight sponsors.

## 2. Reference Artifacts for Redesign
Use these as the baseline visual/content reference set for the one-shot redesign:
- X post example: [https://x.com/devYonz/status/2014830161334608299](https://x.com/devYonz/status/2014830161334608299)
- Current event summary graphic (LoFi/33 scheduled talks with sponsor rail)
- Three current speaker cards (Benjamin Hindman, Robel Estifanos, Glauber Costa)
- Discord announcement screenshot showing event summary + per-talk cards

These should be treated as required fixture content for regression previews when redesigning.

## 3. Current Implementation and Functionality

### 3.1 Authoring + export route
- Route: `src/routes/event-graphic/+page.svelte`
- Responsibilities:
  - Event metadata input (title, number, date, time, timezone, URLs, logo).
  - Speaker input (name, social platform/handle, profile image source, talk, bio, talk points).
  - Avatar fetch from Twitter/Bluesky/custom URL via APIs.
  - Persist event payload to KV (`/api/save-event`).
  - Export PNGs:
    - Event graphic: `1120x630` via `domToPng`.
    - Speaker cards: `800x450` each via `domToPng`.

### 3.2 Render components
- `src/lib/components/EventGraphic.svelte`
  - Renders meetup summary block, speakers list, sponsor strip, and CTA buttons.
  - Pulls sponsor logos from `src/lib/data/sponsors.json`.
- `src/lib/components/SpeakerCard.svelte`
  - Renders one speaker-focused card with talk title and bullets.

### 3.3 Data and APIs
- Persistence:
  - `src/routes/api/save-event/+server.ts`
  - `src/routes/api/latest-event/+server.ts`
  - `src/lib/server/kv.ts` (`current_event` in Cloudflare KV).
- Image resolution/proxy:
  - `src/routes/api/profile-image/+server.ts`
  - `src/routes/api/proxy-image/+server.ts`
  - `src/routes/api/proxy-bsky-image/+server.ts`

## 4. Where It Is Used

### 4.1 Internal product usage (code paths)
- Homepage Join section embeds the same event component:
  - `src/routes/+page.svelte` -> `<EventGraphic eventData={eventDataForGraphic} />`
- Right sponsor rail meetup module consumes event data:
  - `src/lib/components/SponsorsRail.svelte`
  - Used on homepage/directory/blog layouts.
- Global top banner uses current event metadata:
  - `src/lib/components/EventBanner.svelte`
  - Wired from `src/routes/+layout.svelte` and `src/routes/+layout.server.ts`.

### 4.2 External publishing workflow
- Event summary PNG used for X feed posts.
- Event summary PNG + speaker card PNGs used in Discord announcements.
- Bluesky adoption target: same content set, platform-safe exports.

## 5. Current Gaps to Address
- Single-size export strategy (currently fixed `1120x630` and `800x450`) is not explicitly platform-aware.
- No export bundle/manifest to guarantee deterministic multi-platform publishing.
- Sponsor treatment exists but is not first-class in export rules (no tier/priority constraints in generator UI).
- Social model is partially legacy (`twitterHandle` still central); platform-neutral speaker identity should be canonical.
- No built-in guardrails for text overflow, sponsor lockup fallback, or alt-text generation.

## 6. Proposed New Visual Format (Unified System)

### 6.1 Format family
Use one canonical layout system with three templates:
- `Agenda`: Multi-speaker event summary (replaces current main card).
- `Spotlight`: Single-speaker feature card (replaces current speaker card style).
- `Sponsor`: Sponsor-forward companion card (for thread/reply follow-up posts and Discord stacking).

### 6.2 Visual direction
- Keep LoFi identity cues (dot texture + warm-to-cool gradient), but simplify density and increase hierarchy.
- Lock layout to a 12-column grid with fixed safe zones.
- Sponsor block becomes a required region on every exported asset:
  - Partner tier always visible above Gold tier logos.
  - Minimum sponsor logo size and contrast thresholds.

### 6.3 Content hierarchy rules
- Primary: Event name + date/time + talk title(s).
- Secondary: speaker identity and social handle.
- Persistent CTA: `Join Discord` + `Add to Calendar`.
- Sponsor lockup: always present, never visually subordinate to background patterns.

## 7. Spec-Driven One-Shot Redesign Packet

### 7.1 Canonical spec object (single source of truth)
Define `EventGraphicSpec` with:
- `event`: title, number, startTimeISO, displayDateTime, links.
- `speakers[]`: name, social handles by platform, talk title, bio, bullets, avatar.
- `sponsors[]`: name, tier, url, logoLight/logoDark, priority.
- `theme`: token set + variant (`agenda|spotlight|sponsor`).
- `exports[]`: list of required output targets.

### 7.2 Deterministic render contract
- Input: one `EventGraphicSpec`.
- Output: full artifact bundle + manifest in one run:
  - `event-agenda.x.png`
  - `event-agenda.bsky.jpg`
  - `event-agenda.discord.png`
  - `speaker-<name>.x.png` (per speaker)
  - `manifest.json` (dimensions, filesize, checksums, alt text)
  - `captions.md` (platform-ready copy snippets)

## 8. Platform Export Matrix

### 8.1 Recommended targets
- `x_feed`: `1200x675` (16:9), PNG/JPG, <= 5MB.
- `bsky_feed`: `1200x675` (16:9), JPG/WebP, <= 950KB target (hard cap 1,000,000 bytes).
- `discord_feed`: `1280x720` (16:9), PNG, <= 10MB.
- `homepage_component`: no image dependency required; consume structured event spec JSON and render reactively through Svelte components.

### 8.2 Backward compatibility
- Keep legacy `1120x630` event export and `800x450` speaker export during migration, then deprecate after rollout validation.

### 8.3 Source notes (platform limits)
As of February 18, 2026:
- Bluesky docs (`app.bsky.embed.images`) confirm up to 4 images and `maxSize = 1,000,000` bytes per image:
  - https://docs.bsky.app/docs/advanced-guides/posts
- X Help confirms photo upload formats and limits (JPEG/PNG/WEBP/GIF; up to 5MB for photos on x.com):
  - https://help.x.com/en/using-x/posting-gifs-and-pictures
- X Cards reference provides image ratio constraints for large summary cards (`2:1`, `300x157` min, `<5MB`):
  - https://docs.x.com/x-api/fundamentals/cards/overview/summary-card-with-large-image
- Discord FAQ confirms non-Nitro upload size (`10MB`) and attachment behavior:
  - https://support.discord.com/hc/en-us/articles/25444343291031-File-Attachments-FAQ

`1200x675` (16:9) is selected as an implementation inference for cross-platform feed consistency, while strict byte caps are enforced per target.

## 9. Implementation Plan

### Phase 0: Baseline capture
- Save current LoFi/33 assets as golden fixtures.
- Add screenshot diff baseline for:
  - `/event-graphic` preview
  - homepage Join section
  - sponsor rail meetup card

### Phase 1: Data contract + pipeline
- Introduce `EventGraphicSpec` and mapper from existing `formData`.
- Normalize social handles to platform-keyed model.
- Add export manifest and deterministic filenames.

### Phase 2: Template rebuild
- Rebuild `EventGraphic.svelte` and `SpeakerCard.svelte` around shared layout primitives.
- Add sponsor-first lockup component with tier ordering and constraints.
- Add overflow rules for long talk titles and bullet lists.

### Phase 3: Multi-platform exports
- Add export presets (`x_feed`, `bsky_feed`, `discord_feed`, legacy).
- Add automatic compression path for Bluesky-specific files.
- Add per-export validation (dimension, filesize, min contrast checks).

### Phase 4: Homepage and UI integration
- Ensure homepage Meetup Join component is driven from same structured event spec.
- Keep banner + sponsor rail consuming same event source.
- Add preview toggles in `/event-graphic` for each export target.

### Phase 5: Operational rollout
- Publish updated runbook: generate bundle -> publish sequence for X/Discord/Bluesky.
- Deprecate manual ad hoc resizing workflow.
- Enable post-run summary output with file paths + status.

## 10. Acceptance Criteria
- One action in `/event-graphic` produces a complete multi-platform bundle and manifest.
- Generated artifacts are within platform constraints and visually consistent.
- Sponsor logos are clearly visible and tier-prioritized on all exported assets.
- Homepage Meetup component, sponsor rail meetup panel, and event banner all reflect the same event payload without manual edits.
- Fixture test set (LoFi/33) passes visual regression after redesign.
