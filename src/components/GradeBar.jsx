import { GRADES } from '../lib/srs.js';
import styles from './GradeBar.module.css';

/** The three grading buttons, generated from the GRADES table. */
export function GradeBar({ onGrade }) {
  return (
    <div className={styles.grades}>
      {GRADES.map(({ id, label, hint, key }) => (
        <button
          key={id}
          type="button"
          data-grade={id}
          className={styles.grade}
          onClick={() => onGrade(id)}
        >
          <span className={styles.key}>{key}</span>
          <span>{label}</span>
          <span className={styles.hint}>{hint}</span>
        </button>
      ))}
    </div>
  );
}
