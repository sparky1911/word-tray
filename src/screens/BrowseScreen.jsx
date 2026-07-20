import { useDeferredValue, useMemo, useRef, useState, useEffect } from 'react';
import { Button } from '../components/ui/Button.jsx';
import { WORDS } from '../data/words.js';
import { boxOf } from '../lib/srs.js';
import { useHotkeys } from '../hooks/useHotkeys.jsx';
import styles from './BrowseScreen.module.css';

const LIMIT = 300;
const pad = (n) => String(n).padStart(2, '0');

export function BrowseScreen({ store, onExit }) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useHotkeys({ esc: onExit }, { allowInInputs: ['esc'] });

  const hits = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    const matches = q
      ? WORDS.map((w, i) => [w, i]).filter(([w]) =>
          w[0].includes(q) || w[1].toLowerCase().includes(q))
      : WORDS.map((w, i) => [w, i]);
    return matches.slice(0, LIMIT);
  }, [deferred]);

  return (
    <>
      <div className="row row--between" style={{ marginBottom: 'var(--s-4)' }}>
        <Button variant="ghost" onClick={onExit} hotkey="esc">← Tray</Button>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`search ${WORDS.length} words…`}
          aria-label="Search words and meanings"
        />
      </div>

      <p className="label">{hits.length}{hits.length === LIMIT ? '+' : ''} shown</p>

      {hits.length === 0 ? (
        <p className={`prose ${styles.empty}`}>Nothing matches “{query}”. Try a shorter fragment.</p>
      ) : (
        <table className={styles.table}>
          <tbody>
            {hits.map(([word, id]) => (
              <tr key={id}>
                <td className={styles.term}>{word[0]}</td>
                <td className={styles.gloss}>{word[1]}</td>
                <td className={styles.badge}>g{pad(word[2] + 1)} · b{boxOf(store.progress, id)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
