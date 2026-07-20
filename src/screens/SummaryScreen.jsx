import { Button } from '../components/ui/Button.jsx';
import { GROUPS, WORDS } from '../data/words.js';
import { countBy, isMastered, missesOf } from '../lib/srs.js';
import { useHotkeys } from '../hooks/useHotkeys.jsx';
import styles from './SummaryScreen.module.css';

const LEECH_THRESHOLD = 3;
const pad = (n) => String(n).padStart(2, '0');

export function SummaryScreen({ store, groupIndex, stats, onExit, onRestart }) {
  const { progress } = store;
  const ids = groupIndex === null ? WORDS.map((_, i) => i) : GROUPS[groupIndex];

  const mastered = countBy(ids, progress, isMastered);
  const accuracy = stats.answered ? Math.round((stats.correct / stats.answered) * 100) : 0;

  const leeches = ids
    .filter((id) => missesOf(progress, id) >= LEECH_THRESHOLD)
    .sort((a, b) => missesOf(progress, b) - missesOf(progress, a))
    .slice(0, 8);

  useHotkeys({ esc: onExit, enter: onExit });

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>
        {groupIndex === null ? 'Review cleared' : `Group ${pad(groupIndex + 1)} cleared`}
      </h2>
      <p className={`prose ${styles.blurb}`}>
        {stats.answered} answers at {accuracy}% accuracy. {mastered} of {ids.length} words
        are now in box 4 or 5.
      </p>

      <div className="row row--center">
        <Button variant="solid" onClick={onExit} hotkey="esc">Back to tray</Button>
        {groupIndex !== null && (
          <Button variant="ghost" onClick={() => onRestart(groupIndex)}>Run this group again</Button>
        )}
      </div>

      {leeches.length > 0 && (
        <div className={styles.leech}>
          <h3>Words fighting back</h3>
          <ul className={styles.list}>
            {leeches.map((id) => (
              <li key={id}>
                <strong>{WORDS[id][0]}</strong>
                <em>{missesOf(progress, id)} misses</em>
              </li>
            ))}
          </ul>
          <p className="prose" style={{ marginTop: 'var(--s-4)', fontSize: 'var(--fs-md)' }}>
            Rewrite these rather than grinding them. A word that keeps failing needs a
            sharper example sentence or a hook, not another repetition.
          </p>
        </div>
      )}
    </div>
  );
}
