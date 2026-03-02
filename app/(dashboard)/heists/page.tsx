'use client'

import Link from 'next/link'
import { useHeists } from '@/hooks/useHeists'
import HeistCard from '@/components/HeistCard'
import HeistCardSkeleton from '@/components/HeistCardSkeleton'
import styles from './heists.module.css'

const SKELETON_COUNT = 3

export default function HeistsPage() {
  const { data: activeHeists, loading: activeLoading } = useHeists('active')
  const { data: assignedHeists, loading: assignedLoading } = useHeists('assigned')

  return (
    <div className="page-content">
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Your Active Heists</h2>
        {activeLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <HeistCardSkeleton key={i} />
            ))}
          </div>
        ) : activeHeists.length > 0 ? (
          <div className={styles.grid}>
            {activeHeists.map((heist) => (
              <HeistCard key={heist.id} heist={heist} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>No active heists on your radar.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Heists You&apos;ve Assigned</h2>
        {assignedLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <HeistCardSkeleton key={i} />
            ))}
          </div>
        ) : assignedHeists.length > 0 ? (
          <div className={styles.grid}>
            {assignedHeists.map((heist) => (
              <HeistCard key={heist.id} heist={heist} />
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p className={styles.empty}>No heists assigned yet.</p>
            <Link href="/heists/create" className="btn">Create Heist</Link>
          </div>
        )}
      </section>
    </div>
  )
}
