'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import PageLoader from "@/components/PageLoader"

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (user) router.push("/heists")
  }, [isLoading, user, router])

  if (isLoading || user) {
    return <PageLoader />
  }

  return (
    <main className="public">
      {children}
    </main>
  )
}
