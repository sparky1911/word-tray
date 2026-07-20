/**
 * Reads the palettes straight out of tokens.css and asserts every
 * foreground/background pairing the UI actually uses clears WCAG.
 * Run with `npm run check:contrast` — it fails the build on a regression.
 */
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const relLum = (hex) => {
  const ch = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = ch.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [relLum(a), relLum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** [description, foreground token, background token, minimum ratio] */
const PAIRS = [
  ['body text',       'c-text',     'c-bg',            4.5],
  ['secondary copy',  'c-text-2',   'c-bg',            4.5],
  ['labels and meta', 'c-dim',      'c-bg',            4.5],
  ['labels on panels','c-dim',      'c-surface',       4.5],
  ['due + misses',    'c-alert',    'c-bg',            4.5],
  ['mastered green',  'c-ok',       'c-bg',            4.5],
  ['card front',      'c-card-ink', 'c-card-face',     4.5],
  ['card back',       'c-on-strong','c-accent-strong', 4.5],
  ['solid button',    'c-on-strong','c-accent-strong', 4.5],
  ['control borders', 'c-line',     'c-bg',            3.0], // WCAG 1.4.11
];

const blocks = [...css.matchAll(/\n(:root,\n\[data-theme='dark'\]|\[data-theme='light'\]) \{([\s\S]*?)\n\}/g)];
if (blocks.length !== 2) {
  console.error('Expected exactly two palette blocks in tokens.css, found', blocks.length);
  process.exit(1);
}

let failed = 0;
for (const [, selector, body] of blocks) {
  const palette = Object.fromEntries(
    [...body.matchAll(/--(c-[\w-]+):\s*(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])
  );
  const name = selector.includes('dark') ? 'dark' : 'light';
  console.log(`\n  ${name}  (background ${palette['c-bg']})`);

  for (const [label, fg, bg, min] of PAIRS) {
    if (!palette[fg] || !palette[bg]) {
      console.error(`    MISSING  ${fg} or ${bg}`);
      failed++;
      continue;
    }
    const r = contrast(palette[fg], palette[bg]);
    const pass = r >= min;
    if (!pass) failed++;
    const grade = !pass ? 'FAIL' : r >= 7 ? 'AAA ' : 'AA  ';
    console.log(`    ${grade} ${r.toFixed(2).padStart(5)}:1  ${label}${pass ? '' : `  (needs ${min})`}`);
  }
}

console.log(failed ? `\n${failed} contrast failure(s)\n` : '\nAll pairs pass\n');
process.exit(failed ? 1 : 0);
