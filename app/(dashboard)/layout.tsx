'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import PageLoader from "@/components/PageLoader"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, isLoading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (!user) router.push("/login")
  }, [isLoading, user, router])

  if (isLoading || !user) {
    return <PageLoader />
  }

  return (
    <div className="site-layout">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
