import { Tray } from '../components/Tray.jsx';
import { Button } from '../components/ui/Button.jsx';
import { WORDS } from '../data/words.js';
import { countBy, isDue, isMastered } from '../lib/srs.js';
import { downloadState, uploadState } from '../lib/storage.js';
import { useHotkeys } from '../hooks/useHotkeys.jsx';

const ALL_IDS = WORDS.map((_, i) => i);

export function HomeScreen({ store, onStudy, onBrowse }) {
  const { progress, direction, state, toggleDirection, reset, replace } = store;

  const dueCount = countBy(ALL_IDS, progress, isDue);
  const masteredCount = countBy(ALL_IDS, progress, isMastered);

  const reviewDue = () => { if (dueCount) onStudy(null); };

  const restore = async () => {
    try { replace(await uploadState()); }
    catch (err) { if (err.message !== 'No file chosen') alert(err.message); }
  };

  const confirmReset = () => {
    if (confirm('Reset all progress? The word list stays, every box goes back to zero.')) reset();
  };

  useHotkeys({ r: reviewDue, d: toggleDirection, '/': onBrowse });

  return (
    <>
      <div className="row row--between" style={{ marginBottom: 'var(--s-4)' }}>
        <p className="label">Pick a group</p>
        <p className={`label ${dueCount ? 'label--alert' : ''}`}>{dueCount} due today</p>
      </div>

      <Tray progress={progress} onOpen={onStudy} />

      <div className="row" style={{ marginTop: 'var(--s-7)' }}>
        <Button variant="solid" onClick={reviewDue} disabled={!dueCount} hotkey="R">
          Review everything due ({dueCount})
        </Button>
        <Button variant="ghost" onClick={toggleDirection} hotkey="D">
          {direction === 'termFirst' ? 'Word → meaning' : 'Meaning → word'}
        </Button>
        <Button variant="ghost" onClick={onBrowse} hotkey="/">Browse list</Button>
        <Button variant="ghost" onClick={() => downloadState(state)}>Back up</Button>
        <Button variant="ghost" onClick={restore}>Restore</Button>
        <Button variant="ghost" onClick={confirmReset}>Reset</Button>
      </div>

      <p className="label" style={{ marginTop: 'var(--s-5)' }}>
        {masteredCount} of {WORDS.length} mastered · press ? for keyboard shortcuts
      </p>
    </>
  );
}
