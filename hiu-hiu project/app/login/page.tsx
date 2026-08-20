'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BACKEND_URL } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, {
        credentials: 'include',
      })
      const { csrfToken } = await csrfResponse.json()
      const response = await fetch(`${BACKEND_URL}/api/auth/login/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'เข้าสู่ระบบไม่สำเร็จ')
      router.push('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'เข้าสู่ระบบไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-secondary/60 px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Image
            src="/logo.jpg"
            alt="โลโก้ HiuHiu"
            width={32}
            height={32}
            className="rounded-md object-cover shadow-sm"
          />
          <span className="font-display text-lg font-bold text-foreground">HiuHiu</span>
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-primary/5 sm:p-10">
          <div className="mb-6 flex flex-col items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-accent text-primary shadow-sm">
              <Store className="size-8" />
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground">เข้าสู่ระบบ</h1>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="identifier" className="sr-only">
                อีเมล หรือ ชื่อผู้ใช้งาน
              </label>
              <input
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="อีเมล หรือ ชื่อผู้ใช้งาน"
                autoComplete="username"
                className="h-13 w-full rounded-xl border border-transparent bg-muted px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/25"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                รหัสผ่าน
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                autoComplete="current-password"
                className="h-13 w-full rounded-xl border border-transparent bg-muted px-4 py-3.5 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/25"
              />
            </div>
            {error && <p className="text-sm text-danger-foreground">{error}</p>}
            <Button type="submit" className="h-13 w-full rounded-xl text-base font-semibold">
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            ยังไม่มีบัญชี?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              สมัครสมาชิก
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            &larr; กลับสู่หน้าแรก
          </Link>
        </p>
      </div>
    </main>
  )
}