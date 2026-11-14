# Conventions

## Files & naming

| Kind              | Pattern                         | Example                 |
| ----------------- | ------------------------------- | ----------------------- |
| Component         | `PascalCase.tsx`                | `LensHost.tsx`          |
| Component styles  | `PascalCase.module.css`, beside | `LensHost.module.css`   |
| Section           | `sections/PascalCase.tsx`       | `sections/Programs.tsx` |
| Hook              | `useCamelCase.ts`               | `useViewport.ts`        |
| Logic / utilities | `lib/camelCase.ts`              | `lib/frameLoop.ts`      |
| Context           | `context/NameContext.tsx`       | `PrefsContext.tsx`      |
| Data              | `data/kebab-or-lower.json`      | `data/lettering.json`   |

- Named exports only. No default exports.
- Import through the `@/` alias, not `../../`.
- Constants: `UPPER_SNAKE` for module-level fixed values (`HERO_WORDS`), `camelCase` otherwise.
- Types: `PascalCase`, no `I` prefix. Prefer `type` over `interface`.

## Folders

- `lib/` has no React. It can be tested or reused on its own.
- `hooks/` is the thin layer that connects `lib/` to components.
- `components/` are reusable. `sections/` are used once, in page order.
- `content/copy.ts` holds every visible string. Components never hard-code copy.

## CSS

- One CSS Module per component. Class names in `camelCase` (`.docTitle`).
- Colors, type sizes, spacing and easing come from `styles/tokens.css`. No raw hex or px for those in modules.
- Spacing scale: `--s1`…`--s10` (4 → 128px). Page gutter: `--gut`.
- Type scale: `--t-label`, `--t-small`, `--t-body`, `--t-lead`, `--t-h3`, `--t-h2`.
- Global utilities are few and fixed: `.label`, `.eyebrow`, `.mute`, `.h2`, `.sr-only`.
- Breakpoints: `1100px` (tablet), `760px` (phone). Desktop-first.

## Brand

- The logo and every lockup are drawn from `data/lettering.json`. Never set "sidea" in a font.
- The master lockup emphasizes **s**; bracket lockups emphasise **a**.
- Point color is `--pt`: Sky in dark, Orange in light. It is only for the brackets, bracket words and small accents.

## Motion

- Everything animated subscribes to the shared frame loop (`useFrame` / `subscribeFrame`). No extra `requestAnimationFrame`s, no CSS keyframes for scroll.
- Write to the DOM through refs during a frame. Don't set React state per frame.
- Respect `runtime.motion`. When it is off, jump to the end state.

## Accessibility

- Lens layers are `aria-hidden`. Only the base layer is focusable.
- Interactive non-buttons get `tabIndex`, a label, and Enter/Space handling.
- `index.html` ships crawlable fallback content inside `#root`.

## Commits

[Conventional Commits](https://www.conventionalcommits.org/). Subject in English (imperative) or Korean (noun ending), no period. Body is optional: up to three `-` bullets with facts only.

```
feat(programs): implement horizontal scroll pass

- 600vh 구간에서 세로 스크롤을 가로 이동으로 변환
- 중앙 근접도에 따라 괄호 열림과 설명 노출
```

- Types: `feat` `fix` `style` `refactor` `perf` `docs` `chore`
- Scopes: section or module name (`hero`, `programs`, `lens`, `lettering`, `seo`, …)
- Reference the issue in the first commit of a branch: `Refs #n`

## Branches & PRs

- `main` is always deployable. No direct commits after setup.
- Branch per issue: `feat/…`, `fix/…`, `style/…`, `chore/…`
- One PR per issue, merged with a merge commit. The PR body ends with `Closes #n`.
