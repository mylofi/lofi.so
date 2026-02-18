# Event Graphic Regression Fixtures

This folder tracks baseline artifacts for the spec-driven generator rollout.

## Required reference set

1. X post example: https://x.com/devYonz/status/2014830161334608299
2. Current event summary graphic (LoFi/33 with sponsor rail)
3. Current speaker cards:
   - Benjamin Hindman
   - Robel Estifanos
   - Glauber Costa
4. Discord announcement screenshot (summary + per-talk cards)

## Fixture payload

Use the built-in `LoFi/33` fixture from `/event-graphic` to generate deterministic previews and exports.

## Baseline captures

Store generated snapshots using this naming scheme:

- `event-graphic-preview.lofi33.png`
- `homepage-join.lofi33.png`
- `sponsors-rail.lofi33.png`
- `banner.lofi33.png`

## Export bundle baseline

From `/event-graphic`, run `Generate Full Bundle` with `LoFi/33` and save:

- `event-agenda.x.png`
- `event-agenda.bsky.jpg`
- `event-agenda.discord.png`
- `event-sponsor.x.png`
- `speaker-benjamin-hindman.x.png`
- `speaker-robel-estifanos.x.png`
- `speaker-glauber-costa.x.png`
- `manifest.json`
- `captions.md`
