import { useCallback, useEffect, useMemo, useState } from 'react';
import { applyGrade, EMPTY } from '../lib/srs.js';
import { clearState, loadState, saveState } from '../lib/storage.js';

/**
 * Owns all persisted state: the per-word records and the test direction.
 * Every mutation writes through to localStorage immediately, so closing
 * the tab mid-session never loses an answer.
 */
export function useProgress() {
  const [state, setState] = useState(loadState);
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => { setStorageOk(saveState(state)); }, [state]);

  const gradeWord = useCallback((id, grade) => {
    const { record, correct } = applyGrade(state.progress[id] || EMPTY, grade);
    setState((prev) => ({ ...prev, progress: { ...prev.progress, [id]: record } }));
    return correct;
  }, [state.progress]);

  const toggleDirection = useCallback(() => {
    setState((p) => ({
      ...p,
      direction: p.direction === 'termFirst' ? 'glossFirst' : 'termFirst',
    }));
  }, []);

  const reset = useCallback(() => {
    clearState();
    setState((p) => ({ direction: p.direction, progress: {} }));
  }, []);

  const replace = useCallback((next) => setState(next), []);

  return useMemo(
    () => ({
      progress: state.progress,
      direction: state.direction,
      state,
      storageOk,
      gradeWord,
      toggleDirection,
      reset,
      replace,
    }),
    [state, storageOk, gradeWord, toggleDirection, reset, replace]
  );
}
