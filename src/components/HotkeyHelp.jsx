import { Button } from './ui/Button.jsx';
import { useHotkeys } from '../hooks/useHotkeys.jsx';
import styles from './HotkeyHelp.module.css';

const SHORTCUTS = [
  ['Anywhere', [
    ['Show this list', '?'],
    ['Go back', 'esc'],
    ['Light / dark theme', 't'],
  ]],
  ['Tray', [
    ['Move between groups', '← ↑ ↓ →'],
    ['Open the focused group', 'enter'],
    ['Review everything due', 'r'],
    ['Flip test direction', 'd'],
    ['Search the word list', '/'],
  ]],
  ['Studying', [
    ['Reveal the answer', 'space'],
    ['Again — back to box 1', '1'],
    ['Good — next box', '2'],
    ['Easy — skip a box', '3'],
  ]],
];

export function HotkeyHelp({ onClose }) {
  useHotkeys({ esc: onClose }, { ignoreSuspend: true });

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true" aria-label="Keyboard shortcuts">
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <h2>Keyboard</h2>
        {SHORTCUTS.map(([section, rows]) => (
          <div key={section} className={styles.group}>
            <p className="label">{section}</p>
            <dl className={styles.list}>
              {rows.map(([what, key]) => (
                <div key={what} className={styles.item}>
                  <dt>{what}</dt>
                  <dd>{key}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
        <div className="row row--center" style={{ marginTop: 'var(--s-6)' }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
