import styles from './Screen.module.css';

/**
 * Page frame: wordmark, contextual meta line, an actions slot (the theme
 * switch lives there), and the storage warning.
 */
export function Screen({ meta, actions, storageOk = true, children }) {
  return (
    <div className="page">
      <header className={styles.header}>
        <h1 className={styles.wordmark}>
          Word <em>Tray</em>
        </h1>
        <div className={styles.headerEnd}>
          {meta && <p className={styles.meta}>{meta}</p>}
          {actions}
        </div>
      </header>

      {!storageOk && (
        <p className={styles.warning}>
          This browser is blocking local storage, so progress will vanish when you
          close the tab. Private browsing is usually the cause.
        </p>
      )}

      {children}
    </div>
  );
}
