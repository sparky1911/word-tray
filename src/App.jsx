import { useCallback, useState } from 'react';
import { Screen } from './components/ui/Screen.jsx';
import { HotkeyHelp } from './components/HotkeyHelp.jsx';
import { ThemeToggle } from './components/ThemeToggle.jsx';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { StudyScreen } from './screens/StudyScreen.jsx';
import { BrowseScreen } from './screens/BrowseScreen.jsx';
import { WORDS, GROUPS } from './data/words.js';
import { useProgress } from './hooks/useProgress.js';
import { useTheme } from './hooks/useTheme.js';
import { HotkeySuspension, useHotkeys } from './hooks/useHotkeys.jsx';

const HOME = { name: 'home' };

export default function App() {
  const store = useProgress();
  const theme = useTheme();
  const [route, setRoute] = useState(HOME);
  const [runId, setRunId] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  const goHome = useCallback(() => setRoute(HOME), []);
  const study = useCallback((groupIndex) => {
    setRunId((n) => n + 1);
    setRoute({ name: 'study', groupIndex });
  }, []);

  // Global keys: available on every screen, and above the modal suspension
  // so the help sheet can be toggled from inside itself.
  useHotkeys(
    { '?': () => setHelpOpen((v) => !v), t: theme.cycle },
    { ignoreSuspend: true }
  );

  const meta = route.name === 'home' ? `${WORDS.length} words · ${GROUPS.length} groups` : null;

  return (
    <Screen meta={meta} actions={<ThemeToggle theme={theme} />} storageOk={store.storageOk}>
      <HotkeySuspension suspended={helpOpen}>
        {route.name === 'home' && (
          <HomeScreen store={store} onStudy={study} onBrowse={() => setRoute({ name: 'browse' })} />
        )}

        {route.name === 'study' && (
          <StudyScreen
            key={runId}
            store={store}
            groupIndex={route.groupIndex}
            onExit={goHome}
            onRestart={study}
          />
        )}

        {route.name === 'browse' && <BrowseScreen store={store} onExit={goHome} />}
      </HotkeySuspension>

      {helpOpen && <HotkeyHelp onClose={() => setHelpOpen(false)} />}
    </Screen>
  );
}
