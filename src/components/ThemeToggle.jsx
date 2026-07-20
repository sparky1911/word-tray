import { THEMES } from '../hooks/useTheme.js';
import styles from './ThemeToggle.module.css';

const LABEL = { system: 'Auto', light: 'Light', dark: 'Dark' };

/** Three-way theme switch. `t` cycles it from the keyboard. */
export function ThemeToggle({ theme }) {
  return (
    <div className={styles.toggle} role="group" aria-label="Colour theme">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          className={styles.option}
          aria-pressed={theme.preference === option}
          onClick={() => theme.setPreference(option)}
        >
          {LABEL[option]}
        </button>
      ))}
    </div>
  );
}
