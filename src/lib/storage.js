/* Progress persistence. localStorage only — nothing leaves the device. */

const KEY = 'wordtray.v1';

const EMPTY_STATE = { direction: 'termFirst', progress: {} };

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.progress !== 'object') return EMPTY_STATE;
    return { ...EMPTY_STATE, ...parsed };
  } catch {
    return EMPTY_STATE;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false; // private mode, quota, disabled storage
  }
}

export function clearState() {
  try { localStorage.removeItem(KEY); } catch { /* nothing to do */ }
}

export function downloadState(state, filename = 'wordtray-progress.json') {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(state)], { type: 'application/json' })
  );
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}

/** Opens a file picker and resolves with a validated state object. */
export function uploadState() {
  return new Promise((resolve, reject) => {
    const input = Object.assign(document.createElement('input'), {
      type: 'file',
      accept: 'application/json',
    });
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return reject(new Error('No file chosen'));
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result));
          if (!parsed || typeof parsed.progress !== 'object') throw new Error('bad shape');
          resolve({ ...EMPTY_STATE, ...parsed });
        } catch {
          reject(new Error('That file is not a Word Tray backup.'));
        }
      };
      reader.onerror = () => reject(new Error('Could not read that file.'));
      reader.readAsText(file);
    };
    input.click();
  });
}
