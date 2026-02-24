import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

export function useUser() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error(
      "useUser must be used within an AuthProvider. Wrap your component tree with <AuthProvider> in app/layout.tsx."
    )
  }

  return context
}
