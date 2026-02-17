import styles from "./Skeleton.module.css"

export default function Skeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatar} />
        <div className={styles.headerLines}>
          <div className={styles.line} />
          <div className={`${styles.line} ${styles.short}`} />
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.line} />
        <div className={styles.line} />
        <div className={`${styles.line} ${styles.partial}`} />
      </div>
    </div>
  )
}
