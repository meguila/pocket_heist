import Link from 'next/link'
import { Clock, User, Calendar } from 'lucide-react'
import { Heist } from '@/types/firestore'
import styles from './HeistCard.module.css'

interface HeistCardProps {
  heist: Heist
}

function getTimeRemaining(deadline: Date): string {
  const diff = deadline.getTime() - Date.now()
  if (diff <= 0) return 'Expired'
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days} day${days === 1 ? '' : 's'} left`
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} left`
  const minutes = Math.floor(diff / (1000 * 60))
  return `${minutes} minute${minutes === 1 ? '' : 's'} left`
}

function formatCreatedAt(date: Date): string {
  const datePart = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const timePart = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${datePart}, ${timePart}`
}

export default function HeistCard({ heist }: HeistCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <Link href={`/heists/${heist.id}`} className={styles.titleLink}>
          <h3 className={styles.title}>{heist.title}</h3>
        </Link>
        <Clock size={14} className={styles.clockIcon} strokeWidth={1.75} />
      </div>

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <User size={12} className={styles.metaIcon} strokeWidth={1.75} />
          <span className={styles.metaLabel}>To:</span>
          <span className={styles.codename}>{heist.assignedToCodename}</span>
        </div>
        <div className={styles.metaRow}>
          <User size={12} className={styles.metaIcon} strokeWidth={1.75} />
          <span className={styles.metaLabel}>By:</span>
          <span className={styles.codename}>{heist.createdByCodename}</span>
        </div>
      </div>

      <p className={styles.timeRemaining}>{getTimeRemaining(heist.deadline)}</p>

      <div className={styles.dateRow}>
        <Calendar size={12} className={styles.metaIcon} strokeWidth={1.75} />
        <span className={styles.date}>{formatCreatedAt(heist.createdAt)}</span>
      </div>
    </div>
  )
}
