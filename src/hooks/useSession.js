import { useCallback, useState } from 'react';

/**
 * A study run over a queue of word ids.
 * Missed words are pushed to the back so they come round again before the
 * session ends — the single most useful thing a flashcard app can do.
 */
export function useSession(initialQueue, groupIndex) {
  const [queue, setQueue] = useState(initialQueue);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ answered: 0, correct: 0 });

  const currentId = queue[0] ?? null;
  const finished = queue.length === 0;

  const reveal = useCallback(() => setRevealed(true), []);

  const advance = useCallback((correct) => {
    setQueue(([head, ...rest]) => (correct ? rest : [...rest, head]));
    setStats((s) => ({ answered: s.answered + 1, correct: s.correct + (correct ? 1 : 0) }));
    setRevealed(false);
  }, []);

  return { queue, currentId, finished, revealed, reveal, advance, stats, groupIndex };
}
