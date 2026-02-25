// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import Link from "next/link"
import { Clock8, Users, Target, Zap } from "lucide-react"
import styles from "./page.module.css"

const TICK_COUNT = 60

export default function Home() {
  return (
    <div className={styles.scene}>

      {/* Decorative vault ring */}
      <div className={styles.vaultRing} aria-hidden="true" />

      {/* Clock tick marks */}
      <div className={styles.ticks} aria-hidden="true">
        {Array.from({ length: TICK_COUNT }).map((_, i) => (
          <span
            key={i}
            className={styles.tick}
            style={{ transform: `rotate(${i * (360 / TICK_COUNT)}deg)` }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className={styles.content}>

        <p className={styles.eyebrow}>Operation Initiated</p>

        <h1 className={styles.logoMark}>
          P<Clock8 strokeWidth={2.75} />cket Heist
        </h1>

        <p className={styles.tagline}>
          <strong>Pull off something legendary.</strong>
        </p>

        <div className={styles.rule} aria-hidden="true" />

        <p className={styles.body}>
          The app where ordinary workdays become extraordinary capers.
          Recruit your crew, plan the perfect move, and execute before
          the coffee gets cold. No vault required — just nerves of steel.
        </p>

        <div className={styles.cta}>
          <Link href="/signup" className={styles.ctaPrimary}>
            Start your heist
          </Link>
          <Link href="/login" className={styles.ctaSecondary}>
            Already have a crew?
          </Link>
        </div>

        <div className={styles.chips}>
          <span className={styles.chip}>
            <Users />
            Recruit a crew
          </span>
          <span className={styles.chip}>
            <Target />
            Plan the job
          </span>
          <span className={styles.chip}>
            <Zap />
            Execute flawlessly
          </span>
        </div>

      </div>
    </div>
  )
}
