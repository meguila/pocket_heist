'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/hooks/useUser"
import { COLLECTIONS, FirestoreUser } from "@/types/firestore"
import styles from "./CreateHeistForm.module.css"

export default function CreateHeistForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<FirestoreUser[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, COLLECTIONS.USERS))
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          codename: (doc.data() as FirestoreUser).codename,
        }))
        setUsers(docs)
      } catch {
        setError("Could not load users. Please refresh and try again.")
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const title = (form.elements.namedItem("title") as HTMLInputElement).value
    const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value
    const assignedTo = (form.elements.namedItem("assignedTo") as HTMLSelectElement).value

    const assignee = users.find((u) => u.id === assignedTo)
    if (!assignee || !user) {
      setError("Could not resolve assignee. Please refresh and try again.")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      await addDoc(collection(db, COLLECTIONS.HEISTS), {
        title,
        description,
        createdBy: user.uid,
        createdByCodename: user.displayName ?? "",
        assignedTo: assignee.id,
        assignedToCodename: assignee.codename,
        deadline: new Date(Date.now() + 48 * 60 * 60 * 1000),
        finalStatus: null,
        createdAt: serverTimestamp(),
      })
      router.push("/heists")
    } catch (err) {
      console.error("[CreateHeistForm] addDoc failed:", err)
      setError("Failed to create heist. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="heist-title">Title</label>
        <input
          id="heist-title"
          name="title"
          type="text"
          required
          onChange={() => setError(null)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="heist-description">Description</label>
        <textarea
          id="heist-description"
          name="description"
          required
          rows={4}
          onChange={() => setError(null)}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="heist-assignedTo">Assign To</label>
        <select
          id="heist-assignedTo"
          name="assignedTo"
          required
          disabled={usersLoading || users.length === 0}
          className={usersLoading || users.length === 0 ? styles.disabledSelect : ""}
        >
          {usersLoading && <option value="">Loading agents…</option>}
          {!usersLoading && users.length === 0 && <option value="">No agents available</option>}
          {!usersLoading && users.map((u) => (
            <option key={u.id} value={u.id}>{u.codename}</option>
          ))}
        </select>
      </div>
      {error && <p role="alert" className={styles.errorMessage}>{error}</p>}
      <button
        type="submit"
        className="btn"
        disabled={isLoading || usersLoading || users.length === 0}
      >
        {isLoading ? "Creating heist…" : "Create Heist"}
      </button>
    </form>
  )
}
