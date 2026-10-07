'use client'

import { useEffect, useState, type CSSProperties } from 'react'
import { Plus, Pencil, Trash2, Store, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/platform-icon'
import { shops as initialShops, type Platform, type Shop, type ShopStatus } from '@/lib/data'
import { BACKEND_URL } from '@/lib/api'

const platforms: Platform[] = ['Facebook', 'Instagram', 'X (Twitter)']

const adminStatus: Record<ShopStatus, { label: string; className: string }> = {
  safe: { label: 'ปลอดภัย', className: 'bg-safe text-safe-foreground border-safe-foreground/20' },
  watch: {
    label: 'รอยืนยัน',
    className: 'bg-warn text-warn-foreground border-warn-foreground/20',
  },
  caution: {
    label: 'มิจฉาชีพ',
    className: 'bg-danger text-danger-foreground border-danger-foreground/20',
  },
}

const statusOptionStyle: Record<ShopStatus, CSSProperties> = {
  safe: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  watch: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  caution: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
}

function isValidExternalUrl(value?: string | null) {
  if (!value) return false

  const trimmed = value.trim()
  if (!trimmed) return false

  try {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const parsed = new URL(normalized)
    return ['http:', 'https:'].includes(parsed.protocol) && !!parsed.hostname
  } catch {
    return false
  }
}

type Row = Shop

function resolveImageUrl(value?: string | null) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  return `${BACKEND_URL}${value.startsWith('/') ? value : `/${value}`}`
}

function backendStatusToUiStatus(value: string): ShopStatus {
  if (value === 'safe') return 'safe'
  if (value === 'scam') return 'caution'
  return 'watch'
}

function uiStatusToBackendStatus(value: ShopStatus): 'safe' | 'pending' | 'scam' {
  if (value === 'safe') return 'safe'
  if (value === 'caution') return 'scam'
  return 'pending'
}

export function AdminClient() {
  const [rows, setRows] = useState<Row[]>(initialShops)
  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [draftPlatform, setDraftPlatform] = useState<Platform>('Facebook')
  const [draftStatus, setDraftStatus] = useState<ShopStatus>('watch')
  const [draftDescription, setDraftDescription] = useState('')
  const [draftImageFile, setDraftImageFile] = useState<File | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newPlatform, setNewPlatform] = useState<Platform>('Facebook')
  const [newStatus, setNewStatus] = useState<ShopStatus>('watch')
  const [newDescription, setNewDescription] = useState('')
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [error, setError] = useState('')

  async function apiRequest(path: string, options: RequestInit = {}, omitJsonContentType = false) {
    const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
    const { csrfToken } = await csrfResponse.json()
    const headers: Record<string, string> = {
      'X-CSRFToken': csrfToken,
      ...(options.headers as Record<string, string> || {}),
    }

    if (!omitJsonContentType) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.detail || data.error || 'ดำเนินการไม่สำเร็จ')
    return data
  }

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('กรุณาเข้าสู่ระบบก่อน')
        const data = await response.json()
        if (!data.user?.is_staff) throw new Error('บัญชีนี้ไม่มีสิทธิ์แอดมิน')
        setAuthorized(true)
        return fetch(`${BACKEND_URL}/api/shops/`)
      })
      .then((response) => response.json())
      .then((data) => {
        const loadedShops: Row[] = data.map((shop: any) => ({
          id: String(shop.id),
          name: shop.name,
          platform: shop.platform?.toLowerCase().includes('instagram')
            ? 'Instagram'
            : shop.platform?.toLowerCase().includes('twitter') || shop.platform?.toLowerCase() === 'x'
              ? 'X (Twitter)'
              : 'Facebook',
          status: backendStatusToUiStatus(shop.status),
          description: shop.description || '',
          image: resolveImageUrl(shop.image),
          link: shop.url || '#',
        }))
        setRows(loadedShops)
      })
        .catch((error) => console.error('ตรวจสอบสิทธิ์ไม่สำเร็จ:', error))
        .finally(() => setCheckingAccess(false))
  }, [])

  async function setStatus(id: string, status: ShopStatus) {
    setError('')
    try {
      await apiRequest(`/api/shops/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: uiStatusToBackendStatus(status) }),
      })
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'บันทึกสถานะไม่สำเร็จ')
    }
  }

  async function remove(id: string) {
    setError('')
    try {
      await apiRequest(`/api/shops/${id}/`, { method: 'DELETE' })
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'ลบร้านค้าไม่สำเร็จ')
    }
  }

  function startEdit(row: Row) {
    setEditingId(row.id)
    setDraftName(row.name)
    setDraftUrl(row.link || '')
    setDraftPlatform(row.platform)
    setDraftStatus(row.status)
    setDraftDescription(row.description || '')
    setDraftImageFile(null)
  }

  async function saveEdit(id: string) {
    setError('')
    try {
      const name = draftName.trim()
      const trimmedUrl = draftUrl.trim()
      if (!name) return

      if (!isValidExternalUrl(trimmedUrl)) {
        setError('URL ร้านค้าไม่ถูกต้อง ต้องเป็นลิงก์ที่มี http:// หรือ https:// เช่น https://facebook.com/yourpage')
        return
      }

      const platform = draftPlatform === 'Facebook' ? 'facebook' : draftPlatform === 'Instagram' ? 'instagram' : 'x_twitter'
      const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
      const formData = new FormData()
      formData.append('name', name)
      formData.append('url', normalizedUrl)
      formData.append('platform', platform)
      formData.append('status', uiStatusToBackendStatus(draftStatus))
      formData.append('description', draftDescription.trim())
      if (draftImageFile) {
        formData.append('image', draftImageFile)
      }

      const updated = await apiRequest(`/api/shops/${id}/`, {
        method: 'PATCH',
        body: formData,
      }, true)
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                name: updated.name,
                platform: draftPlatform,
                status: backendStatusToUiStatus(updated.status),
                description: updated.description || '',
                image: resolveImageUrl(updated.image),
                link: updated.url || normalizedUrl,
              }
            : r,
        ),
      )
      setEditingId(null)
      setDraftImageFile(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'แก้ไขร้านค้าไม่สำเร็จ')
    }
  }

  async function addShop(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const trimmedName = newName.trim()
    const trimmedUrl = newUrl.trim()

    if (!trimmedName) {
      setError('กรุณากรอกชื่อร้านค้า')
      return
    }

    if (!isValidExternalUrl(trimmedUrl)) {
      setError('URL ร้านค้าไม่ถูกต้อง ต้องเป็นลิงก์ที่มี http:// หรือ https:// เช่น https://facebook.com/yourpage')
      return
    }

    try {
      const platform = newPlatform === 'Facebook' ? 'facebook' : newPlatform === 'Instagram' ? 'instagram' : 'x_twitter'
      const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
      const formData = new FormData()
      formData.append('name', trimmedName)
      formData.append('url', normalizedUrl)
      formData.append('platform', platform)
      formData.append('status', uiStatusToBackendStatus(newStatus))
      formData.append('description', newDescription.trim())
      if (newImageFile) {
        formData.append('image', newImageFile)
      }

      const shop = await apiRequest('/api/shops/', {
        method: 'POST',
        body: formData,
      }, true)
      setRows((prev) => [
        {
          id: String(shop.id),
          name: shop.name,
          platform: newPlatform,
          status: backendStatusToUiStatus(shop.status),
          description: shop.description || '',
          image: resolveImageUrl(shop.image),
          link: shop.url,
        },
        ...prev,
      ])
      setNewName('')
      setNewUrl('')
      setNewPlatform('Facebook')
      setNewStatus('watch')
      setNewDescription('')
      setNewImageFile(null)
      setAdding(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'เพิ่มร้านค้าไม่สำเร็จ')
    }
  }

  if (checkingAccess) {
    return <p className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
  }

  if (!authorized) {
    return <p className="rounded-3xl border border-danger/30 bg-card p-12 text-center text-sm text-danger-foreground">บัญชีนี้ไม่มีสิทธิ์เข้าจัดการร้านค้า</p>
  }

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-accent text-accent-foreground">
            <Store className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              จัดการร้านค้า (Whitelist)
            </h1>
            <p className="text-sm text-muted-foreground">จัดการรายชื่อร้านค้าใน Whitelist</p>
          </div>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="h-10 gap-2 rounded-xl px-4">
          <Plus className="size-4" />
          เพิ่มร้านค้า
        </Button>
      </div>

      {adding && (
        <form
          onSubmit={addShop}
          className="grid gap-3 border-b border-border bg-muted/40 p-6 md:grid-cols-2"
        >
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              ชื่อร้านค้า
            </label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="ชื่อร้านค้าใหม่"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              URL ร้านค้า
            </label>
            <input
              required
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://facebook.com/..."
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              แพลตฟอร์ม
            </label>
            <select
              value={newPlatform}
              onChange={(e) => setNewPlatform(e.target.value as Platform)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              สถานะความปลอดภัย
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as ShopStatus)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
              style={statusOptionStyle[newStatus]}
            >
              <option value="safe" style={statusOptionStyle.safe}>ปลอดภัย</option>
              <option value="watch" style={statusOptionStyle.watch}>รอยืนยัน</option>
              <option value="caution" style={statusOptionStyle.caution}>มิจฉาชีพ</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              คำอธิบายร้านค้า
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="ใส่รายละเอียดเพิ่มเติมของร้านค้า"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              รูปร้านค้า
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewImageFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
            {newImageFile && (
              <p className="mt-1 text-xs text-muted-foreground">ไฟล์ที่เลือก: {newImageFile.name}</p>
            )}
          </div>

          <div className="flex gap-2 md:col-span-2 md:justify-end">
            <Button type="submit" className="h-10 rounded-lg px-5">
              บันทึก
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
              className="h-10 rounded-lg px-4"
            >
              ยกเลิก
            </Button>
          </div>
        </form>
      )}

      {error && <p className="border-b border-danger/20 bg-danger/10 px-6 py-3 text-sm text-danger-foreground">{error}</p>}

      {/* header row */}
      <div className="hidden grid-cols-[2fr_1.2fr_1.2fr_1fr] gap-4 px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>ชื่อร้านค้า</span>
        <span>แพลตฟอร์ม</span>
        <span>สถานะ</span>
        <span className="text-right">การจัดการ</span>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[2fr_1.2fr_1.2fr_1fr] md:items-center md:gap-4 ${
              editingId === row.id ? 'bg-muted/20' : ''
            }`}
          >
            <div className="min-w-0">
              {editingId === row.id ? (
                <div className="space-y-2">
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    autoFocus
                    className="h-9 w-full rounded-lg border border-primary bg-background px-3 text-sm outline-none ring-2 ring-ring/25"
                    placeholder="ชื่อร้านค้า"
                  />
                  <input
                    value={draftUrl}
                    onChange={(e) => setDraftUrl(e.target.value)}
                    type="url"
                    placeholder="https://facebook.com/..."
                    className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
                  />
                  <textarea
                    value={draftDescription}
                    onChange={(e) => setDraftDescription(e.target.value)}
                    rows={2}
                    placeholder="คำอธิบายร้านค้า"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDraftImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-2 file:py-1.5 file:font-medium file:text-primary-foreground"
                  />
                  {draftImageFile && <p className="text-xs text-muted-foreground">ไฟล์ใหม่: {draftImageFile.name}</p>}
                </div>
              ) : (
                <>
                  <span className="font-medium text-foreground">{row.name}</span>
                  {row.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.description}</p>
                  )}
                  {row.image && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      มีรูปภาพร้านแล้ว
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {editingId === row.id ? (
                <select
                  value={draftPlatform}
                  onChange={(e) => setDraftPlatform(e.target.value as Platform)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <PlatformIcon platform={row.platform} className="size-4" />
                  {row.platform}
                </>
              )}
            </div>

            <div>
              {editingId === row.id ? (
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value as ShopStatus)}
                  className="h-8 w-fit min-w-28 rounded-full border px-3 text-xs font-medium outline-none"
                  style={statusOptionStyle[draftStatus]}
                  aria-label={`สถานะที่แก้ไขของ ${row.name}`}
                >
                  <option value="safe" style={statusOptionStyle.safe}>ปลอดภัย</option>
                  <option value="watch" style={statusOptionStyle.watch}>รอยืนยัน</option>
                  <option value="caution" style={statusOptionStyle.caution}>มิจฉาชีพ</option>
                </select>
              ) : (
                <select
                  value={row.status}
                  onChange={(e) => setStatus(row.id, e.target.value as ShopStatus)}
                  className="h-8 w-fit min-w-28 rounded-full border px-3 text-xs font-medium outline-none"
                  style={statusOptionStyle[row.status]}
                  aria-label={`สถานะของ ${row.name}`}
                >
                  <option value="safe" style={statusOptionStyle.safe}>ปลอดภัย</option>
                  <option value="watch" style={statusOptionStyle.watch}>รอยืนยัน</option>
                  <option value="caution" style={statusOptionStyle.caution}>มิจฉาชีพ</option>
                </select>
              )}
            </div>

            <div className="flex items-center gap-1 md:justify-end">
              {editingId === row.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => saveEdit(row.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-safe-foreground hover:bg-safe"
                  >
                    <Check className="size-4" />
                    บันทึก
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                  >
                    <X className="size-4" />
                    ยกเลิก
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(row)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  >
                    <Pencil className="size-4" />
                    แก้ไข
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(row.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger-foreground transition hover:bg-danger"
                  >
                    <Trash2 className="size-4" />
                    ลบ
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 && (
        <p className="px-6 py-16 text-center text-sm text-muted-foreground">
          ยังไม่มีร้านค้าใน Whitelist กด “เพิ่มร้านค้า” เพื่อเริ่มต้น
        </p>
      )}
    </div>
  )
}
