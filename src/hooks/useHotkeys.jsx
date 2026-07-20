import { createContext, useContext, useEffect, useMemo, useRef } from 'react';

/** Normalises a KeyboardEvent to a lowercase lookup token. */
function tokenFor(e) {
  if (e.code === 'Space') return 'space';
  const k = e.key.toLowerCase();
  return { ' ': 'space', escape: 'esc', arrowup: 'up', arrowdown: 'down',
           arrowleft: 'left', arrowright: 'right' }[k] ?? k;
}

const isTypingTarget = (el) =>
  el instanceof HTMLElement &&
  (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

const SuspendContext = createContext(false);

/**
 * Suspends every hotkey binding beneath it. Modals wrap the app in this so a
 * single Esc closes the dialog instead of also firing the screen behind it.
 */
export function HotkeySuspension({ suspended, children }) {
  const value = useMemo(() => suspended, [suspended]);
  return <SuspendContext.Provider value={value}>{children}</SuspendContext.Provider>;
}

/**
 * Declarative keyboard bindings.
 *
 *   useHotkeys({ space: reveal, 1: () => grade('again'), esc: goBack });
 *
 * Bindings are skipped while the user types in a field (unless listed in
 * `allowInInputs`) and while a modal has suspended the scope (unless
 * `ignoreSuspend` is set, which is how the modal binds its own keys).
 *
 * @param {Record<string, (e: KeyboardEvent) => void>} bindings
 * @param {{ enabled?: boolean, allowInInputs?: string[], ignoreSuspend?: boolean }} [options]
 */
export function useHotkeys(bindings, options = {}) {
  const { enabled = true, allowInInputs = [], ignoreSuspend = false } = options;
  const suspended = useContext(SuspendContext);
  const active = enabled && (ignoreSuspend || !suspended);

  const ref = useRef({ bindings, allowInInputs });
  ref.current = { bindings, allowInInputs };

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const handler = ref.current.bindings[tokenFor(e)];
      if (!handler) return;
      if (isTypingTarget(e.target) && !ref.current.allowInInputs.includes(tokenFor(e))) return;
      e.preventDefault();
      handler(e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active]);
}
