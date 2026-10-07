'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BACKEND_URL } from '@/lib/api'

type CurrentUser = {
  username: string
  email: string
  is_staff: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          router.replace('/login')
          return
        }
        const data = await response.json()
        setUser(data.user)
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, {
      credentials: 'include',
    })
    const { csrfToken } = await csrfResponse.json()
    await fetch(`${BACKEND_URL}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrfToken },
    })
    router.push('/')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-start justify-center px-4 py-10">
        {loading ? (
          <p className="text-sm text-muted-foreground">กำลังโหลดโปรไฟล์...</p>
        ) : user ? (
          <section className="w-full rounded-3xl border border-border bg-card p-8 shadow-sm sm:p-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="grid size-20 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                {user.username.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">{user.username}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                {user.is_staff && <p className="mt-2 text-xs font-medium text-primary">ผู้ดูแลระบบ</p>}
              </div>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {user.is_staff && (
                <Link href="/admin" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  จัดการหลังบ้าน
                </Link>
              )}
              <button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">
                <LogOut className="size-4" />
                ออกจากระบบ
              </button>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  )
}