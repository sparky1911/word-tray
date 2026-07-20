import { useMemo } from 'react';
import { Flashcard } from '../components/Flashcard.jsx';
import { GradeBar } from '../components/GradeBar.jsx';
import { Button } from '../components/ui/Button.jsx';
import { SummaryScreen } from './SummaryScreen.jsx';
import { GROUPS, WORDS } from '../data/words.js';
import { EMPTY, GRADES, buildDueQueue, buildGroupQueue, getRecord } from '../lib/srs.js';
import { useHotkeys } from '../hooks/useHotkeys.jsx';
import { useSession } from '../hooks/useSession.js';

const ALL_IDS = WORDS.map((_, i) => i);
const pad = (n) => String(n).padStart(2, '0');

/** `groupIndex === null` means a mixed review across every due word. */
function initialQueue(groupIndex, progress, includeAll) {
  if (groupIndex === null) return buildDueQueue(ALL_IDS, progress);
  const ids = GROUPS[groupIndex];
  const queue = buildGroupQueue(ids, progress);
  return queue.length || !includeAll ? queue : [...ids];
}

export function StudyScreen({ store, groupIndex, onExit, onRestart }) {
  const { progress, direction, gradeWord } = store;

  // Snapshot the queue once; grading during the session must not reshuffle it.
  const queue = useMemo(
    () => initialQueue(groupIndex, progress, true),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupIndex]
  );

  const session = useSession(queue, groupIndex);
  const { currentId, finished, revealed, reveal, advance, stats } = session;

  const submit = (grade) => {
    if (!revealed || currentId === null) return;
    advance(gradeWord(currentId, grade));
  };

  useHotkeys({
    space: () => (revealed ? null : reveal()),
    enter: () => (revealed ? null : reveal()),
    esc: onExit,
    ...Object.fromEntries(GRADES.map((g) => [g.key, () => submit(g.id)])),
  });

  if (finished) {
    return <SummaryScreen store={store} groupIndex={groupIndex} stats={stats} onExit={onExit} onRestart={onRestart} />;
  }

  const label = groupIndex === null ? 'Mixed review' : `Group ${pad(groupIndex + 1)}`;
  const record = getRecord(progress, currentId) ?? EMPTY;

  return (
    <>
      <div className="row row--between" style={{ marginBottom: 'var(--s-5)' }}>
        <Button variant="ghost" onClick={onExit} hotkey="esc">← Tray</Button>
        <p className="label">
          <b>{label}</b> · <b>{session.queue.length}</b> left
        </p>
      </div>

      <Flashcard
        word={WORDS[currentId]}
        record={record}
        revealed={revealed}
        direction={direction}
        onReveal={reveal}
      />

      {revealed
        ? <GradeBar onGrade={submit} />
        : <div className="row row--center"><Button variant="solid" onClick={reveal} hotkey="space">Reveal answer</Button></div>}

      <div className="row row--center row--gap-lg" style={{ marginTop: 'var(--s-5)' }}>
        <span className="label">seen <b>{stats.answered}</b></span>
        <span className="label">correct <b>{stats.correct}</b></span>
        <span className="label">misses on this word <b>{record[3]}</b></span>
      </div>
    </>
  );
}
