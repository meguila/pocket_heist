'use client'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { generateCodename } from "@/lib/codename"
import styles from "./SignupForm.module.css"

function mapFirebaseError(code: string | undefined): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists."
    case "auth/weak-password":
      return "Password must be at least 6 characters."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    default:
      return "Something went wrong. Please try again."
  }
}

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value

    setError(null)
    setIsLoading(true)

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      const codename = generateCodename()
      await updateProfile(user, { displayName: codename })
      await setDoc(doc(db, "users", user.uid), { id: user.uid, codename })
      router.push("/heists")
    } catch (err) {
      const code = (err as { code?: string }).code
      setError(mapFirebaseError(code))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          onChange={() => setError(null)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="signup-password">Password</label>
        <div className={styles.passwordWrapper}>
          <input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="new-password"
            onChange={() => setError(null)}
          />
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className={styles.errorMessage}>{error}</p>
      )}
      <button type="submit" className="btn" disabled={isLoading}>
        {isLoading ? "Creating account…" : "Sign Up"}
      </button>
      <p className={styles.switchLink}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </form>
  )
}
