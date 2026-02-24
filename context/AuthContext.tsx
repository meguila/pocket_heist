'use client'

import { createContext, useState, useEffect } from "react"
import { onAuthStateChanged } from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "@/lib/firebase"

type AuthContextValue = {
  user: User | null
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setIsLoading(false)
    })
    return unsubscribe
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
