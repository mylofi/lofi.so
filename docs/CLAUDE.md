# CLAUDE.md — lofi.so

## Project Overview

**lofi.so** is the community directory and resource hub for local-first software. Built with SvelteKit and deployed on Cloudflare Pages, it showcases local-first tools, projects, learning resources, and hosts monthly LoFi meetup events with speaker spotlights and sponsor showcases.

**Live site:** https://lofi.so

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Svelte 5 + SvelteKit 2.16 |
| Build | Vite 6 |
| Language | TypeScript 5 (strict mode) |
| Styling | TailwindCSS 3.4 (class-based dark mode) |
| Deployment | Cloudflare Pages + Workers |
| Storage | Cloudflare Workers KV (`eventData` namespace) |
| AI Chat | Google Gemini API (via OpenAI SDK) |
| Search | Fuse.js (client-side fuzzy search, static index) |
| Markdown | mdsvex (`.svx` files in routes) |
| Screenshots | modern-screenshot (dom-to-image export) |
| Package Manager | Yarn 3.6.3 |

---

## Commands

```bash
yarn install              # Install dependencies
yarn dev                  # Vite dev server (localhost:5173)
yarn build                # Production build (auto-runs generate-search-index)
yarn preview              # Preview production build locally
yarn dev:cf               # Cloudflare Pages local dev server
yarn check                # TypeScript + Svelte type checking
yarn check:watch          # Continuous type checking
yarn format               # Prettier format all files
yarn lint                 # Prettier check (CI validation)
yarn generate-search-index # Rebuild static/search-index.json from content
yarn deploy               # Deploy to Cloudflare Pages via wrangler
```

---

## Directory Structure

```
src/
├── app.css                     # Global styles + Tailwind imports
├── app.html                    # HTML shell template
├── app.d.ts                    # Global TS declarations (App.Platform)
├── hooks.server.ts             # Server hooks (platform context)
├── lib/
│   ├── components/             # Reusable Svelte components
│   │   ├── Chat.svelte
│   │   ├── DirectoryItemGrid.svelte
│   │   ├── EventBanner.svelte
│   │   ├── EventGraphic.svelte     # Main event announcement/agenda card
│   │   ├── EventPopup.svelte
│   │   ├── Footer.svelte
│   │   ├── Hero.svelte
│   │   ├── NavBar.svelte
│   │   ├── RecentSearches.svelte
│   │   ├── SearchButton.svelte
│   │   ├── SearchModal.svelte
│   │   ├── SearchResults.svelte
│   │   ├── SpeakerCard.svelte      # Speaker spotlight card
│   │   ├── SponsorCard.svelte      # Sponsor showcase card
│   │   ├── SponsorLockup.svelte    # Reusable sponsor grid (8 prop variants)
│   │   └── SponsorsRail.svelte     # Homepage sidebar with event + sponsors
│   ├── data/                       # Static JSON content
│   │   ├── content.json            # Sections, readings, videos
│   │   ├── heading.json            # Page intro text
│   │   ├── sponsors.json           # Sponsor list (order-based)
│   │   ├── event.json              # Event configuration
│   │   ├── mentions.json           # Social testimonials
│   │   ├── event-graphic-fixtures.json  # Fixture data for event graphics
│   │   ├── directory/              # Directory items, categories
│   │   │   ├── Item.json
│   │   │   ├── Category.json
│   │   │   └── Main_Category.json
│   │   └── blogs/                  # Markdown blog posts
│   ├── server/                     # Server-only code
│   │   ├── context.ts              # AsyncLocalStorage for Cloudflare platform
│   │   └── kv.ts                   # Cloudflare KV read/write + normalization
│   ├── stores/                     # Svelte writable stores
│   │   ├── searchStore.ts
│   │   ├── themeStore.ts
│   │   ├── chatStore.ts
│   │   ├── categoryStore.ts
│   │   ├── directorySearchStore.ts
│   │   ├── bannerStore.ts
│   │   └── popupStore.ts
│   ├── types/                      # TypeScript type definitions
│   │   ├── directory.ts
│   │   └── event-graphic.ts        # EventGraphicSpec type system
│   ├── utils/                      # Client utilities
│   │   ├── search.ts               # Fuse.js integration
│   │   ├── gemini.ts               # Chat API call
│   │   ├── localFirstContext.ts    # System prompt builder
│   │   ├── date.ts                 # Date formatting helpers
│   │   └── event-graphic-spec.ts   # Spec normalization + export utils
│   └── index.ts                    # Lib barrel export
├── routes/                         # SvelteKit file-based routing
│   ├── +layout.svelte              # Root layout (NavBar, Banner, Footer, Chat)
│   ├── +layout.server.ts           # Root server load (event data, sponsors)
│   ├── +page.svelte                # Homepage
│   ├── +page.server.ts             # Homepage server load
│   ├── api/                        # API endpoints
│   │   ├── chat/+server.ts
│   │   ├── latest-event/+server.ts
│   │   ├── save-event/+server.ts
│   │   ├── proxy-image/+server.ts
│   │   ├── proxy-bsky-image/+server.ts
│   │   └── profile-image/+server.ts
│   ├── blog/                       # Blog list + [slug] detail
│   ├── directory/                  # Directory with sidebar nav
│   │   ├── apps/[slug]
│   │   └── projects/[slug]
│   ├── learn/                      # Learning resources
│   ├── mentions/                   # Social testimonials
│   └── event-graphic/              # Event graphic authoring + export
│       └── +page.svelte            # Full export workflow page
static/
├── fonts/                    # Archivo font (woff2)
├── images/                   # Logos, icons, sponsor assets
├── search-index.json         # Auto-generated at build time
└── _routes.json              # Cloudflare routing config
scripts/
├── generate-search-index.js  # Builds search-index.json from content
└── setup-dev-environment.js  # Dev environment setup
docs/
└── fixtures/event-graphic/   # Baseline screenshots and export bundles
```

---

## Code Style & Conventions

### Formatting (Prettier)

- **Tabs** for indentation (not spaces)
- **Single quotes** for strings
- **No trailing commas**
- **100 char** print width
- Plugins: `prettier-plugin-svelte`, `prettier-plugin-tailwindcss`

### TypeScript

- Strict mode enabled
- Module resolution: `bundler`
- `resolveJsonModule: true`, `esModuleInterop: true`
- Types go in `$lib/types/` with dedicated files per domain
- Use `interface` for object shapes, union literals for enums

### Svelte Patterns

- **Stores**: Writable store factory pattern — create function returns `{ subscribe, ...methods }`
- **Reactivity**: `$:` reactive declarations, `$storeValue` auto-subscriptions
- **SSR guard**: `import { browser } from '$app/environment'` before client-only code
- **Props**: Declared via `export let propName` with optional defaults
- **Conditional classes**: `class:hidden={condition}` or ternary in template strings

### Imports

- Always use `$lib/` alias for library imports:
  ```ts
  import Hero from '$lib/components/Hero.svelte';
  import { theme } from '$lib/stores/themeStore';
  import type { DirectoryItem } from '$lib/types/directory';
  ```
- Relative imports only for sibling components in the same directory

### Naming

| Thing | Convention | Example |
|-------|-----------|---------|
| Components | PascalCase `.svelte` | `SpeakerCard.svelte` |
| Stores | camelCase ending in `Store` | `themeStore.ts` |
| Utils | camelCase `.ts` | `event-graphic-spec.ts` |
| Routes | lowercase SvelteKit convention | `+page.svelte`, `+server.ts` |
| Booleans | `is` prefix | `isOpen`, `isLoading`, `isEventPassed` |
| Types | PascalCase | `EventGraphicSpec`, `DirectoryItem` |

### Tailwind

- Dark mode: `class="bg-white dark:bg-gray-800"`
- Responsive: mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Custom breakpoint: `xs:` at 470px
- Custom colors: `primary` (#4C62FF), `discord` (#FFB21D), `ink`, `paper`, `panel`
- Font: `font-sans` resolves to Archivo

---

## Git Workflow

- **`main`** — production, deployed to Cloudflare Pages
- **`dev`** — integration branch, merges to `main` via PR
- **Feature branches** — named `feat/description`, `fix/description`, `refactor/description`
- **Worktree branches** — named `vk/{short-id}-{description}` (managed by Vibe Kanban)
- PRs target `dev` unless shipping directly to `main`
- Commit style: `feat:`, `fix:`, `refactor:`, `docs:` conventional prefixes

---

## Event Graphic System (Key Architecture)

The event graphic system generates social media assets for monthly LoFi meetups. It was upgraded in PR #65 to be **spec-driven**.

### Core Type: `EventGraphicSpec`

Defined in `$lib/types/event-graphic.ts` — the canonical shape for all event rendering:

```
EventGraphicSpec
├── event: { title, number, startTimeISO, displayDateTime, links }
├── speakers: EventGraphicSpeaker[]
├── sponsors: EventGraphicSponsor[]  (sorted by `order` field)
├── theme: { variant, tokens }
└── exports: EventGraphicExportTarget[]
```

### Normalization Pipeline

```
LegacyEventData → toEventGraphicSpec() → EventGraphicSpec
EventGraphicSpec → fromEventGraphicSpec() → LegacyEventData (round-trip)
```

Located in `$lib/utils/event-graphic-spec.ts`. All KV reads/writes normalize through this pipeline to guarantee consistency.

### Render Templates (Variants)

| Variant | Purpose | Component |
|---------|---------|-----------|
| `agenda` | Full event announcement with speakers + sponsors | `EventGraphic.svelte` |
| `spotlight` | Individual speaker card with bio + talk points | `SpeakerCard.svelte` |
| `sponsor` | Sponsor showcase card | `SponsorCard.svelte` |

### Export Targets

| Target ID | Dimensions | Format | Use Case |
|-----------|-----------|--------|----------|
| `announcement_regular` | 1200x675 | jpg | X/Bluesky feed posts |
| `announcement_discord` | 800x320 | png | Discord server banner |
| `agenda_regular` | 1200x675 | png | Speaker spotlight posts |

Legacy target IDs (`x_feed`, `bsky_feed`, `discord_feed`, `speaker_x_feed`, etc.) map to these three canonical targets.

### Export Pipeline (`/event-graphic`)

1. User fills event form or loads fixture
2. Form data normalized to `EventGraphicSpec`
3. Preview components render to DOM
4. `domToPng` captures each target at exact dimensions
5. Format conversion with iterative quality optimization (jpg/webp)
6. Validation: dimensions, byte budget, contrast check, SHA256 checksum
7. Bundle: artifacts + `manifest.json` + `captions.md`
8. Download as zip

### Sponsor Ordering

Sponsors use **order-based sorting**. Each sponsor has an `order: number` field. `normalizeSponsors()` sorts ascending. Default sponsors loaded from `$lib/data/sponsors.json`.

### Homepage Integration

- `+page.server.ts` fetches event data from KV via `getLatestEvent()`
- `EventGraphic` renders in `layoutMode="homepage"` with compact sponsor sidebar
- `SponsorsRail` shows sticky sidebar with event status (upcoming vs recorded)
- Event status derived from `startTimeISO` comparison to `Date.now()`

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI chat (Gemini) with local-first context |
| `/api/latest-event` | GET | Fetch current event from KV |
| `/api/save-event` | POST | Persist event to KV |
| `/api/proxy-image` | GET | Image proxy (CORS bypass) |
| `/api/proxy-bsky-image` | GET | Bluesky image proxy |
| `/api/profile-image` | GET | Speaker profile image (X/Bluesky) |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API for AI chat |
| `KV_REST_API_TOKEN` | Cloudflare KV access token |
| `KV_REST_API_URL` | Cloudflare KV REST endpoint |

Set in `.env` (local dev) and Cloudflare Pages environment settings (production).

---

## Search System

1. `scripts/generate-search-index.js` runs at build time (`prebuild` hook)
2. Indexes content from `$lib/data/content.json` into `static/search-index.json`
3. Client loads index and uses Fuse.js for fuzzy matching
4. 300ms debounced input in `SearchModal.svelte`
5. Results rendered in `SearchResults.svelte` with section/category grouping

---

## Cloudflare Configuration

- **Adapter**: `@sveltejs/adapter-cloudflare` with `nodejs_compat`
- **KV Namespace**: `eventData` binding (id: `a582ee811be9420d8bdc1bbeaa437fee`)
- **Build output**: `.svelte-kit/cloudflare`
- **Compatibility date**: `2025-04-24`
- Local CF dev: `yarn dev:cf` (uses wrangler)

---

## Key Data Files

| File | Purpose |
|------|---------|
| `$lib/data/content.json` | Main site content (sections, readings, videos) |
| `$lib/data/sponsors.json` | Sponsor list with order + logos |
| `$lib/data/event.json` | Event metadata |
| `$lib/data/mentions.json` | Social testimonials for /mentions |
| `$lib/data/event-graphic-fixtures.json` | Test fixtures for event graphic regression |
| `$lib/data/directory/Item.json` | Directory app/project entries |
| `$lib/data/directory/Category.json` | Directory categories |
| `$lib/data/directory/Main_Category.json` | Top-level directory categories |

---

## Testing

No test framework is currently configured. Quality checks available:

- `yarn check` — SvelteKit sync + `svelte-check` for TypeScript/Svelte diagnostics
- `yarn lint` — Prettier formatting validation
- Event graphic fixture system provides regression baselines in `docs/fixtures/`

---

## Common Patterns to Follow

1. **Always normalize event data** through `toEventGraphicSpec()` before rendering or persisting
2. **Use `$lib/` imports** — never use relative paths that escape the current directory
3. **Guard client-only code** with `import { browser } from '$app/environment'`
4. **Sponsors are order-based** — set `order` field and avoid category-based sizing logic
5. **Export targets map to three canonical formats** — don't create new dimensions without updating the type system
6. **KV operations normalize on both save and read** — idempotent round-trip
7. **Static data lives in `$lib/data/`** as JSON — import directly, don't fetch at runtime
8. **Server-only code** goes in `$lib/server/` — SvelteKit enforces this boundary
