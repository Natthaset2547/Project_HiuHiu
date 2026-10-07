'use client'

import { useEffect, useState } from 'react'
import { ImagePlus, Pencil, Trash2, X } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { BACKEND_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'

type Banner = {
  id: number
  title: string
  subtitle: string
  image: string
  link: string
  is_active: boolean
}

async function csrfToken() {
  const response = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
  return (await response.json()).csrfToken
}

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' }),
      fetch(`${BACKEND_URL}/api/banners/`),
    ])
      .then(async ([userResponse, bannerResponse]) => {
        const userData = await userResponse.json()
        if (!userResponse.ok || !userData.user?.is_staff) throw new Error('บัญชีนี้ไม่มีสิทธิ์แอดมิน')
        setBanners(await bannerResponse.json())
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'โหลดข้อมูลไม่สำเร็จ'))
      .finally(() => setLoading(false))
  }, [])

  async function uploadBanner(event: React.FormEvent) {
    event.preventDefault()
    if (!file && editingId === null) {
      setError('กรุณาเลือกไฟล์แบนเนอร์')
      return
    }
    setSaving(true)
    setError('')
    try {
      const formData = new FormData()
      if (file) formData.append('image', file)
      formData.append('title', title)
      formData.append('subtitle', subtitle)
      formData.append('link', link)
      formData.append('is_active', 'true')
      const endpoint = editingId === null
        ? `${BACKEND_URL}/api/banners/`
        : `${BACKEND_URL}/api/banners/${editingId}/`
      const response = await fetch(endpoint, {
        method: editingId === null ? 'POST' : 'PATCH',
        credentials: 'include',
        headers: { 'X-CSRFToken': await csrfToken() },
        body: formData,
      })
      const contentType = response.headers.get('content-type') || ''
      const banner = contentType.includes('application/json') ? await response.json() : {}
      if (!response.ok) throw new Error(banner.detail || `บันทึกไม่สำเร็จ (${response.status})`)
      setBanners((current) => editingId === null ? [...current, banner] : current.map((item) => item.id === editingId ? banner : item))
      setFile(null)
      setTitle('')
      setSubtitle('')
      setLink('')
      setEditingId(null)
      const input = document.getElementById('banner-file') as HTMLInputElement | null
      if (input) input.value = ''
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'บันทึกไม่สำเร็จ')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(banner: Banner) {
    setEditingId(banner.id)
    setTitle(banner.title)
    setSubtitle(banner.subtitle)
    setLink(banner.link)
    setFile(null)
    const input = document.getElementById('banner-file') as HTMLInputElement | null
    if (input) input.value = ''
  }

  function cancelEdit() {
    setEditingId(null)
    setTitle('')
    setSubtitle('')
    setLink('')
    setFile(null)
  }

  async function removeBanner(id: number) {
    if (!window.confirm('ต้องการลบแบนเนอร์นี้หรือไม่')) return
    const response = await fetch(`${BACKEND_URL}/api/banners/${id}/`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'X-CSRFToken': await csrfToken() },
    })
    if (response.ok) setBanners((current) => current.filter((banner) => banner.id !== id))
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-foreground">จัดการแบนเนอร์</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">อัปโหลดแบนเนอร์เพื่อแสดงบนหน้าแรก</p>
        {error && <p className="mb-4 rounded-xl bg-danger/10 p-3 text-sm text-danger-foreground">{error}</p>}
        <form onSubmit={uploadBanner} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div>
            <label htmlFor="banner-file" className="mb-1.5 block text-sm font-medium">ไฟล์รูปภาพ</label>
            <div className="flex flex-wrap items-center gap-3">
              <label htmlFor="banner-file" className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
                <ImagePlus className="size-4" />
                เลือกรูปภาพ
              </label>
                <input id="banner-file" required={editingId === null} type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] || null)} className="sr-only" />
              <span className="text-sm text-muted-foreground">{file ? file.name : 'ยังไม่ได้เลือกไฟล์'}</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="หัวข้อแบนเนอร์ (ถ้ามี)" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <input value={link} onChange={(event) => setLink(event.target.value)} placeholder="ลิงก์ปลายทาง (ถ้ามี)" type="url" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          </div>
          <textarea value={subtitle} onChange={(event) => setSubtitle(event.target.value)} placeholder="คำอธิบาย (ถ้ามี)" className="min-h-20 w-full rounded-lg border border-border bg-background p-3 text-sm" />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving} className="rounded-xl">{saving ? 'กำลังบันทึก...' : editingId === null ? 'อัปโหลดแบนเนอร์' : 'บันทึกการแก้ไข'}</Button>
            {editingId !== null && <Button type="button" variant="outline" onClick={cancelEdit} className="gap-2 rounded-xl"><X className="size-4" />ยกเลิก</Button>}
          </div>
        </form>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {!loading && banners.map((banner) => (
            <article key={banner.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <img src={banner.image} alt={banner.title || 'แบนเนอร์'} className="aspect-[3/1] w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-4">
                <div><h2 className="font-semibold">{banner.title || 'ไม่มีหัวข้อ'}</h2><p className="text-xs text-muted-foreground">{banner.subtitle || 'ไม่มีคำอธิบาย'}</p></div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => startEdit(banner)} className="text-muted-foreground hover:text-foreground" aria-label="แก้ไขแบนเนอร์"><Pencil className="size-4" /></button>
                  <button type="button" onClick={() => removeBanner(banner.id)} className="text-danger-foreground hover:text-danger" aria-label="ลบแบนเนอร์"><Trash2 className="size-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
