import { useCallback, useEffect, useState } from 'react';

const KEY = 'wordtray.theme';
export const THEMES = ['system', 'light', 'dark'];

const query = () => window.matchMedia('(prefers-color-scheme: light)');

const readStored = () => {
  try {
    const saved = localStorage.getItem(KEY);
    return THEMES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
};

/**
 * Theme preference ('system' | 'light' | 'dark') plus the resolved value.
 * Resolution happens here and is written to <html data-theme>, so the CSS
 * only ever sees a concrete theme and needs no media query of its own.
 */
export function useTheme() {
  const [preference, setPreference] = useState(readStored);
  const [systemLight, setSystemLight] = useState(() => query().matches);

  useEffect(() => {
    const mq = query();
    const onChange = (e) => setSystemLight(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved =
    preference === 'system' ? (systemLight ? 'light' : 'dark') : preference;

  useEffect(() => {
    document.documentElement.dataset.theme = resolved;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', resolved === 'light' ? '#F6F2E9' : '#15152C');
    try { localStorage.setItem(KEY, preference); } catch { /* storage blocked */ }
  }, [resolved, preference]);

  const cycle = useCallback(() => {
    setPreference((p) => THEMES[(THEMES.indexOf(p) + 1) % THEMES.length]);
  }, []);

  return { preference, resolved, setPreference, cycle };
}
