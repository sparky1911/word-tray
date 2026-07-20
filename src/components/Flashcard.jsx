import { Spine } from './ui/Spine.jsx';
import { BOX_COUNT } from '../lib/srs.js';
import styles from './Flashcard.module.css';

/**
 * One card. `direction` decides which side of the pair leads, and the
 * headword always reappears on the back so the pairing is unambiguous.
 */
export function Flashcard({ word, record, revealed, direction, onReveal }) {
  const [term, gloss] = word;
  const [box] = record;
  const termFirst = direction === 'termFirst';

  const front = termFirst ? term : gloss;
  const back = termFirst ? gloss : term;

  return (
    <div className={styles.stage}>
      <button
        type="button"
        className={styles.card}
        data-revealed={revealed}
        onClick={onReveal}
        aria-live="polite"
      >
        <div className={styles.face} data-side="front">
          <div className="row row--between">
            <span className={styles.eyebrow}>
              {box === 0 ? 'New word' : `Box ${box} of ${BOX_COUNT}`}
            </span>
            <Spine box={box} />
          </div>
          <div className={termFirst ? styles.term : styles.gloss}>{front}</div>
          <div className={styles.foot}>Space to reveal</div>
        </div>

        <div className={styles.face} data-side="back">
          <span className={styles.eyebrow}>{termFirst ? 'Meaning' : 'Word'}</span>
          <div className={termFirst ? styles.gloss : styles.term}>{back}</div>
          <div className={styles.foot}>{termFirst ? term : ''}</div>
        </div>
      </button>
    </div>
  );
}
