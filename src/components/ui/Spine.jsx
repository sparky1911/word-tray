import { BOX_COUNT } from '../../lib/srs.js';
import styles from './Spine.module.css';

/** Five notches showing which Leitner box a word currently sits in. */
export function Spine({ box }) {
  return (
    <div className={styles.spine} role="img" aria-label={`Box ${box} of ${BOX_COUNT}`}>
      {Array.from({ length: BOX_COUNT }, (_, i) => (
        <span key={i} className={styles.notch} data-on={i < box} />
      ))}
    </div>
  );
}
