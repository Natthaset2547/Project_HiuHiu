'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, LogIn, LogOut, LayoutGrid, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportModal } from '@/components/report-modal'
import { BACKEND_URL } from '@/lib/api'

type CurrentUser = {
  username: string
  email: string
  is_staff: boolean
}

export function SiteHeader({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json()
        setUser(data.user)
      })
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true))
  }, [])

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
    setUser(null)
    router.push('/')
    router.refresh()
  }

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="โลโก้ HiuHiu"
            width={36}
            height={36}
            className="size-9 rounded-xl object-cover shadow-sm"
            priority
          />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            HiuHiu
          </span>
        </Link>

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              // ถ้าปุ่มที่กดคือปุ่ม Enter ให้ทำคำสั่งด้านล่าง
              if (e.key === 'Enter') {
                e.preventDefault() // เบรกหน้าเว็บไม่ให้รีเฟรช
                if (!query.trim()) return
                const params = new URLSearchParams()
                params.set('q', query.trim())
                router.push(`/shops?${params.toString()}`)
              }
            }}
            placeholder="ค้นหาร้านรับหิ้ว..."
            className="h-10 w-full rounded-full border border-border bg-muted/60 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/25"
            aria-label="ค้นหาร้านรับหิ้ว"
          />
        </div>

        <nav className="flex shrink-0 items-center gap-1">
          {(!authChecked || !user?.is_staff) && (
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors shadow-sm mr-1 sm:mr-2"
            >
              🚨 <span className="hidden sm:inline">แจ้งเบาะแสคนโกง</span>
                 <span className="sm:hidden">แจ้งโกง</span>
            </button>
          )}
          {authChecked && user?.is_staff && (
            <Button
              render={<Link href="/admin" />}
              nativeButton={false}
              variant="ghost"
              className="h-9 gap-2 px-3 text-muted-foreground"
            >
              <LayoutGrid className="size-4" />
              <span className="hidden md:inline">จัดการหลังบ้าน</span>
            </Button>
          )}
          {authChecked && user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-2.5 text-sm font-medium text-foreground transition hover:bg-muted"
                title="โปรไฟล์ของฉัน"
              >
                <span className="grid size-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.username.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.username}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4" />
                <span className="hidden md:inline">ออกจากระบบ</span>
              </button>
            </>
          ) : authChecked ? (
            <>
              <Button
                render={<Link href="/register" />}
                nativeButton={false}
                variant="outline"
                className="h-8 sm:h-9 gap-1 sm:gap-2 rounded-full px-2.5 sm:px-3 text-xs sm:text-sm"
              >
                <UserPlus className="size-3.5 sm:size-4" />
                <span className="hidden sm:inline">สมัครสมาชิก</span>
                <span className="sm:hidden">สมัคร</span>
              </Button>
              <Button
                render={<Link href="/login" />}
                nativeButton={false}
                className="h-8 sm:h-9 gap-1 sm:gap-2 rounded-full px-3 sm:px-4 text-xs sm:text-sm"
              >
                <LogIn className="size-3.5 sm:size-4 hidden sm:inline-block" />
                เข้าสู่ระบบ
              </Button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
    <ReportModal 
      isOpen={isReportModalOpen} 
      onClose={() => setIsReportModalOpen(false)} 
    />
    </>
  )
}
