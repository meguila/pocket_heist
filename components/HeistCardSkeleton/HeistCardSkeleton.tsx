import styles from './HeistCardSkeleton.module.css'

export default function HeistCardSkeleton() {
  return (
    <div className={styles.card} role="status" aria-label="Loading heist">
      <div className={styles.header}>
        <div className={styles.titleLine} />
        <div className={styles.clockIcon} />
      </div>
      <div className={styles.meta}>
        <div className={styles.metaRow} />
        <div className={styles.metaRow} />
      </div>
      <div className={styles.timeLine} />
      <div className={styles.dateLine} />
    </div>
  )
}
