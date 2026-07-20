import { GROUPS } from '../data/words.js';
import { countBy, isDue, isMastered, boxOf } from '../lib/srs.js';
import { useGridNav } from '../hooks/useGridNav.js';
import { useHotkeys } from '../hooks/useHotkeys.jsx';
import styles from './Tray.module.css';

const pad = (n) => String(n).padStart(2, '0');

function GroupCell({ index, ids, progress, onOpen, isCursor }) {
  const mastered = countBy(ids, progress, isMastered);
  const due = countBy(ids, progress, isDue);
  const touched = ids.some((id) => boxOf(progress, id) > 0);
  const complete = mastered === ids.length;

  return (
    <button
      type="button"
      data-cell={index}
      tabIndex={isCursor ? 0 : -1}
      className={styles.cell}
      data-complete={complete}
      data-touched={touched}
      onClick={() => onOpen(index)}
      aria-label={`Group ${index + 1}: ${mastered} of ${ids.length} mastered${due ? `, ${due} due` : ''}`}
    >
      <span className={styles.fill} style={{ height: `${(mastered / ids.length) * 100}%` }} />
      {due > 0 && <span className={styles.dueDot} />}
      <span className={styles.number}>{pad(index + 1)}</span>
      <span className={styles.count}>
        {mastered}
        <small>/{ids.length}</small>
      </span>
    </button>
  );
}

/** The 32-group tray. Arrow keys move, Enter opens. */
export function Tray({ progress, onOpen }) {
  const { containerRef, cursor, setCursor, navigation } = useGridNav(GROUPS.length);

  useHotkeys({
    ...navigation,
    enter: () => onOpen(cursor),
  });

  return (
    <>
      <div ref={containerRef} className={styles.tray} role="group" aria-label="Word groups">
        {GROUPS.map((ids, i) => (
          <GroupCell
            key={i}
            index={i}
            ids={ids}
            progress={progress}
            isCursor={i === cursor}
            onOpen={(n) => { setCursor(n); onOpen(n); }}
          />
        ))}
      </div>

      <div className={`${styles.legend} label`}>
        <span><i className={styles.swatch} />has words due for review</span>
        <span>fill height = words at box 4 or 5</span>
        <span>arrow keys to move, enter to open</span>
      </div>
    </>
  );
}
