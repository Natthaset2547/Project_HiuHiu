'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BACKEND_URL } from '@/lib/api'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfResponse.json()
      const response = await fetch(`${BACKEND_URL}/api/auth/register/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'สมัครสมาชิกไม่สำเร็จ')
      router.push('/')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'สมัครสมาชิกไม่สำเร็จ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/60 px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-xl sm:p-10">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <Image src="/logo.jpg" alt="โลโก้ HiuHiu" width={32} height={32} className="rounded-md object-cover" />
          <span className="font-display text-lg font-bold text-foreground">HiuHiu</span>
        </Link>
        <h1 className="mb-6 text-center font-display text-2xl font-bold text-foreground">สมัครสมาชิก</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="ชื่อผู้ใช้" className="h-13 w-full rounded-xl bg-muted px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="อีเมล" className="h-13 w-full rounded-xl bg-muted px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
          <input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร" className="h-13 w-full rounded-xl bg-muted px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-ring/25" />
          {error && <p className="text-sm text-danger-foreground">{error}</p>}
          <Button type="submit" disabled={loading} className="h-13 w-full rounded-xl text-base font-semibold">{loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}</Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">มีบัญชีแล้ว? <Link href="/login" className="font-semibold text-primary hover:underline">เข้าสู่ระบบ</Link></p>
      </div>
    </main>
  )
}