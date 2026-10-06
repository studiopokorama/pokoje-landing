# Pokoje Homepage

Landing-page web app for Pokoje, built with Vite + React + TypeScript.

## Requirements

- Node.js 20+ (recommended current LTS)
- npm 10+

## Quick Start

```bash
make init
make dev
```

Then open the local URL printed by Vite (typically `http://localhost:5173`).

## Make Targets

- `make help` - list available targets
- `make init` - install dependencies
- `make dev` - run local development server
- `make build` - build production bundle
- `make preview` - preview production bundle locally
- `make lint` - run ESLint
- `make format` - format repository with Prettier
- `make tidy` - alias for `make format`
- `make format-check` - check formatting without changing files
- `make typecheck` - run TypeScript checks
- `make test` - currently mapped to typecheck as a starter baseline
- `make setup-hooks` - install local git hooks path (`.githooks`)
- `make clean` - remove local build output

Git push lint enforcement:

- Pre-push hook at `.githooks/pre-push` runs `make lint`
- `make init` also runs `make setup-hooks` so the hook is active

## CDN Asset Strategy

CDN base URL:

- `https://cdn.pokorama.com/demo/`

Background image tiers (single image requested):

- `low/raster/splash_screens/splash_01.webp`
- `mid/raster/splash_screens/splash_01.webp`
- `high/raster/splash_screens/splash_01.webp`

Runtime chooses one of `low` / `mid` / `high` based on viewport and device pixel ratio to reduce unnecessary transfer while preserving visual quality.

## Store Links From Catalog

Store URLs are resolved at runtime from:

- `https://cdn.pokorama.com/demo/catalog.json`

The app reads `links` and uses `completeApp...` keys (iOS + Android) for badge targets.

## Store Badges

Official badge assets are vendored in:

- `public/assets/google-play-badge.png`
- `public/assets/app-store-badge.svg`

## Fonts

Title font is vendored locally for consistent rendering:

- `src/assets/fonts/LTSaeada-Medium.otf`

License file:

- `src/assets/fonts/OFL.txt`

## Current Structure

```text
.
├── Makefile
├── public/
│   └── assets/
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── lib/
│   │   └── catalog.ts
│   └── main.tsx
└── ...
```

## Expandability Notes

- Keep CDN and catalog logic in `src/lib/` for reuse.
- Add future sections/components under `src/components/`.
- If routing is needed later, introduce `react-router` and `src/routes/`.
