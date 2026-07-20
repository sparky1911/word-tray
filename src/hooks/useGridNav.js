import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Roving-focus arrow navigation for a responsive CSS grid.
 * Column count is measured from the DOM rather than hard-coded, so it stays
 * correct across the grid's breakpoints.
 */
export function useGridNav(count) {
  const containerRef = useRef(null);
  const [columns, setColumns] = useState(1);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const measure = () => {
      const cols = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length;
      setColumns(Math.max(1, cols));
    };
    measure();

    // ResizeObserver is universal in browsers but absent in test/SSR
    // environments, so fall back to a resize listener rather than throwing.
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Only take DOM focus once the user reaches for the keyboard, so loading
  // the page doesn't slam a focus ring onto group 01.
  const engaged = useRef(false);

  const move = useCallback((delta) => {
    engaged.current = true;
    setCursor((c) => Math.min(count - 1, Math.max(0, c + delta)));
  }, [count]);

  const focusCell = useCallback((index) => {
    containerRef.current?.querySelector(`[data-cell="${index}"]`)?.focus();
  }, []);

  useEffect(() => { if (engaged.current) focusCell(cursor); }, [cursor, focusCell]);

  return {
    containerRef,
    cursor,
    setCursor,
    columns,
    navigation: {
      left:  () => move(-1),
      right: () => move(1),
      up:    () => move(-columns),
      down:  () => move(columns),
    },
  };
}
