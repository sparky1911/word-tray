import styles from './Button.module.css';

/**
 * @param {{ variant?: 'solid'|'raised'|'ghost', hotkey?: string }} props
 */
export function Button({ variant = 'raised', hotkey, children, className = '', ...rest }) {
  return (
    <button
      type="button"
      data-variant={variant}
      className={`${styles.button} ${className}`}
      {...rest}
    >
      {children}
      {hotkey && <kbd className={styles.key}>{hotkey}</kbd>}
    </button>
  );
}
