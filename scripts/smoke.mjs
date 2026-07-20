import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const dir = new URL('../dist/', import.meta.url).pathname;
const html = readFileSync(`${dir}/index.html`, 'utf8');
const jsFile = html.match(/src="\.\/(assets\/[^"]+\.js)"/)[1];
const js = readFileSync(`${dir}/${jsFile}`, 'utf8');

const dom = new JSDOM(html.replace(/<script type="module"[^>]*><\/script>/, ''), {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://example.com/',
});
const { window } = dom;
window.matchMedia ||= () => ({ matches: false, addEventListener(){}, removeEventListener(){} });

const errors = [];
window.addEventListener('error', (e) => errors.push(e.error?.stack || e.message));

const el = window.document.createElement('script');
el.textContent = js;
window.document.body.appendChild(el);

await new Promise((r) => setTimeout(r, 400));

const doc = window.document;
const root = doc.getElementById('root');
const text = root.textContent;

const assert = (cond, msg) => {
  if (!cond) { console.error('  FAIL  ' + msg); process.exitCode = 1; }
  else console.log('  ok  ' + msg);
};

console.log('\n== render smoke test ==');
assert(errors.length === 0, 'no runtime errors' + (errors.length ? '\n' + errors[0] : ''));
assert(root.children.length > 0, 'app mounts into #root');
assert(text.includes('Word'), 'wordmark renders');
assert(doc.querySelectorAll('[data-cell]').length === 32, '32 group cells render');
assert(text.includes('960 words'), 'deck size shown');
assert(/Auto|Light|Dark/.test(text), 'theme switch renders');
assert(['light','dark'].includes(doc.documentElement.dataset.theme), 'data-theme is resolved: ' + doc.documentElement.dataset.theme);

// open a group via click and confirm a card appears
doc.querySelector('[data-cell="0"]').click();
await new Promise((r) => setTimeout(r, 200));
assert(/Reveal answer/.test(root.textContent), 'clicking a group starts a session');
assert(/New word/.test(root.textContent), 'first card is marked new');

// reveal + grade
[...root.querySelectorAll('button')].find(b => /Reveal answer/.test(b.textContent)).click();
await new Promise((r) => setTimeout(r, 100));
assert(/Again/.test(root.textContent) && /Easy/.test(root.textContent), 'grade buttons appear after reveal');

[...root.querySelectorAll('button')].find(b => /^2Good/.test(b.textContent.trim()) || /Good/.test(b.textContent)).click();
await new Promise((r) => setTimeout(r, 150));
const saved = window.localStorage.getItem('wordtray.v1');
assert(saved && Object.keys(JSON.parse(saved).progress).length === 1, 'grading writes progress to localStorage');

// --- light theme ---
window.localStorage.setItem('wordtray.theme', 'light');
[...root.querySelectorAll('button')].find(b => b.textContent.trim() === 'Light')?.click();
await new Promise((r) => setTimeout(r, 120));
assert(doc.documentElement.dataset.theme === 'light', 'theme switch repaints to light');
assert(
  doc.querySelector('meta[name="theme-color"]').getAttribute('content') === '#F6F2E9',
  'browser chrome colour follows the theme'
);

// --- keyboard ---
const press = (key) => window.dispatchEvent(new window.KeyboardEvent('keydown', { key, bubbles: true }));
press('t');
await new Promise((r) => setTimeout(r, 120));
assert(doc.documentElement.dataset.theme === 'dark', '`t` cycles the theme');

press('?');
await new Promise((r) => setTimeout(r, 120));
assert(!!doc.querySelector('[role="dialog"]'), '`?` opens the shortcut sheet');
press('Escape');
await new Promise((r) => setTimeout(r, 120));
assert(!doc.querySelector('[role="dialog"]'), 'Escape closes it again');

if (!process.exitCode) console.log('\nall smoke checks passed');
