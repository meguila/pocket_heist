'use client'

import { useState } from "react"
import { Clock8 } from "lucide-react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useUser } from "@/hooks/useUser"
import styles from "./Navbar.module.css"

export default function Navbar() {
  const { user } = useUser()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await signOut(auth)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className={styles.siteNav}>
      <nav>
        <header>
          <h1>
            <Link href="/heists">
              P<Clock8 className={styles.logo} size={14} strokeWidth={2.75} />
              cket Heist
            </Link>
          </h1>
          <div>Tiny missions. Big office mischief.</div>
        </header>
        <ul>
          <li>
            <Link href="/heists/create" className="btn">Create Heist</Link>
          </li>
          {user && (
            <li>
              <button className="btn" onClick={handleLogout} disabled={isLoggingOut}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  )
}
