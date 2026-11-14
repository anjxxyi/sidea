# sidea

Ideas, on the side.

Website for **sidea**, a side project studio. A single page built around the sidea lettering.

## Stack

- React 18 + TypeScript
- Vite
- CSS Modules + design tokens
- Mona Sans (Latin), Pretendard (Korean)
- No animation library. All motion runs on one shared `requestAnimationFrame` loop

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

## Scripts

| Command             | What it does                    |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start the dev server            |
| `npm run build`     | Type-check and build to `dist/` |
| `npm run preview`   | Serve the production build      |
| `npm run lint`      | ESLint                          |
| `npm test`          | Preference regression tests     |
| `npm run format`    | Prettier                        |
| `npm run typecheck` | TypeScript only                 |

## Environment

| Variable             | Used for                                          |
| -------------------- | ------------------------------------------------- |
| `VITE_SITE_URL`      | Canonical URL, Open Graph tags, sitemap, robots   |
| `VITE_CONTACT_EMAIL` | Contact address in the footer and fallback markup |

Both are read at build time. Set the same values in your hosting provider.

First visits start in light mode and English. Theme and language choices are saved in the browser and restored before the page renders on later visits.

## Structure

```
src/
  components/   shared UI (Lockup, LensHost, Header…)
  sections/     page sections, top to bottom
  lib/          framework-free logic: lettering, frame loop, pointer, lens
  hooks/        React glue for lib/
  context/      app-wide state (prefs, toast)
  content/      all copy, EN + KR
  styles/       tokens and globals
  data/         lettering vectors
```

See [docs/CONVENTIONS.md](docs/CONVENTIONS.md) for naming and code style.

## Design

Brand, lettering and design system: [sidea — Brand & Design System](https://www.figma.com/design/DFfD3FeAiFNHzWsAECFX9I) (Figma).

- `src/styles/tokens.css` matches the Figma variables.
- Favicons and the Open Graph image are exported from the Assets page.

## Deploy

Static hosting. Build with `npm run build` and serve `dist/`.

## License

Code © 2026 sidea. The sidea logo and lettering may not be reused.
Mona Sans and Pretendard are licensed under the SIL Open Font License.
