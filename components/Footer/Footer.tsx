import { Clock8 } from "lucide-react"
import Link from "next/link"
import styles from "./Footer.module.css"

export default function Footer() {
  return (
    <footer className={styles.siteFooter}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.appName}>
            P<Clock8 className={styles.logo} size={12} strokeWidth={2.75} />
            cket Heist
          </span>
          <span className={styles.tagline}>Tiny missions. Big office mischief.</span>
        </div>
        <nav className={styles.links}>
          <Link href="/heists">Heists</Link>
          <Link href="/heists/create">Create Heist</Link>
        </nav>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Pocket Heist. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
