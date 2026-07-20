# Word Tray

A keyboard-first flashcard trainer for the 960-word GregMat vocabulary list — 32 groups of 30, Leitner spaced repetition, progress kept in the browser. React + Vite, deploys to GitHub Pages.

```bash
npm install
npm run dev      # local dev server
npm test         # scheduling logic + theme contrast checks
npm run build    # production build into dist/
```

## Deploying to GitHub Pages

The repo ships with `.github/workflows/deploy.yml`, so deployment is automatic.

1. Push this project to a GitHub repo with `main` as the default branch.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. Push to `main`. The workflow builds and publishes; the URL appears in the Actions run.

`vite.config.js` sets `base: './'`, so the build works at any sub-path without configuration. No changes needed if you rename the repo.

## Architecture

The rule throughout: **logic is pure and testable, React only wires it up, and no component owns a colour.**

```
src/
  data/words.js          960 words as [term, definition, groupIndex] + group index
  lib/
    srs.js               Leitner scheduling — pure functions, zero React
    srs.test.mjs         checks for the above (npm test)
    storage.js           localStorage read/write/backup/restore
  hooks/
    useProgress.js       owns persisted state, writes through on every answer
    useSession.js        one study run over a queue of word ids
    useHotkeys.jsx       declarative key bindings + modal suspension
    useGridNav.js        roving-focus arrow navigation for the tray
  components/
    ui/                  Button, Spine, Screen — the shared primitives
    Tray, Flashcard, GradeBar, HotkeyHelp
  screens/               Home, Study, Summary, Browse
  styles/
    tokens.css           every colour, size, space and duration, per theme
    base.css             resets + shared layout classes
scripts/smoke.mjs        render + interaction test (jsdom)
```

### Where the repetition went

- **Variants are data attributes, not classes.** `Button` has one base rule; `data-variant="solid|raised|ghost"` selects the skin. Adding a fourth variant is three lines of CSS and no JSX.
- **Grades come from a table.** `GRADES` in `srs.js` defines the id, label, hint, and hotkey for Again/Good/Easy. `GradeBar` maps over it, `StudyScreen` builds its key bindings from it, and `HotkeyHelp` documents it. Changing a hotkey is a one-line edit in one file.
- **Keyboard handling lives in one hook.** No component adds its own `keydown` listener. `useHotkeys({ space: reveal, esc: goBack })` is the whole API; it handles modifier keys, ignores keystrokes while you're typing in the search field, and defers to modals.
- **Layout helpers are global.** `.row`, `.label`, `.prose`, `.page` in `base.css` cover the patterns that would otherwise be re-declared in every module.

### The style system

`tokens.css` is the only file containing raw values. Everything else references variables, so retheming means editing one file.

`:root` holds everything theme-independent; two `[data-theme]` blocks hold the palettes.

| Group | Tokens |
|---|---|
| Surfaces | `--c-bg` `--c-surface` `--c-raised` `--c-line` `--c-line-soft` |
| Text | `--c-text` `--c-text-2` `--c-dim` `--c-faint` |
| Accent | `--c-accent` `--c-accent-in` `--c-accent-strong` `--c-on-strong` |
| Status | `--c-alert` (due, misses) `--c-ok` (mastered) |
| Card | `--c-card-face` `--c-card-ink` |
| Type | `--f-display` `--f-body` `--f-mono`, `--fs-2xs` → `--fs-2xl`, two fluid sizes for card text |
| Space | `--s-1` → `--s-8` on a 4px base |
| Shape & motion | `--r-sm` `--r-md` `--bw` `--dur-fast` `--dur-flip` `--ease` |

`prefers-reduced-motion` zeroes the duration tokens, which kills every animation in the app at once.

### Light and dark

Both themes are defined only in `tokens.css`; no component knows which one is active. `useTheme` writes `data-theme` onto `<html>`, seeded from the OS on first visit and remembered after. An inline script in `index.html` applies it before first paint, so there's no flash of the wrong theme on load.

The light theme isn't an inversion — its background is the same warm paper the cards use in dark mode, so the two read as one product. The card deliberately inverts against the page in both: paper-on-ink in dark, ink-on-paper in light, which keeps the term the highest-contrast thing on screen either way.

`npm run check:contrast` parses the palettes out of `tokens.css` and asserts every foreground/background pair the UI actually uses. Text pairs must clear 4.5:1 and control borders 3:1 (WCAG 1.4.11); it exits non-zero on a regression, and it runs as part of `npm test`.

## Keyboard

Press `?` anywhere for this list in-app.

| | |
|---|---|
| `?` | shortcuts |
| `esc` | back / close |
| `t` | light / dark theme |
| `← ↑ ↓ →` | move around the tray |
| `enter` | open the focused group |
| `r` | review everything due |
| `d` | flip test direction |
| `/` | search the word list |
| `space` | reveal the answer |
| `1` `2` `3` | Again / Good / Easy |

Arrow navigation measures the grid's real column count from the DOM, so it stays correct across the responsive breakpoints.

## Scheduling

Five boxes. Correct moves a word up one, Easy moves it two, a miss drops it to box 1 and requeues it later in the same session.

| Box | Next review |
|---|---|
| 1 | tomorrow |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 21 days |
| 5 | 45 days |

A word counts as **mastered** at box 4 — four correct answers across roughly eleven days. That's the fill level on each tray cell.

## Storage

Everything lives in `localStorage` under `wordtray.v1`; nothing is uploaded. Progress is therefore per-browser, per-device. **Back up** downloads a JSON file and **Restore** reads one back — that's also how you move progress between your laptop and phone. If storage is blocked (private browsing), the app says so at the top rather than silently losing your answers.

## Known quirks in the source list

- `cumbersome` appears in both group 11 and group 22 of the original PDF, so it's in the deck twice.
- Group 5's `utterly` carries the same definition as `undermine` above it — a typo in the source. Fix it in `src/data/words.js`.
