import styles from './TopBar.module.css'

export default function TopBar() {
  return (
    <header className={styles.topBar}>
      <span className={styles.logo}>Lootopia</span>
    </header>
  )
}
