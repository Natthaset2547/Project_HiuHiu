'use client'

import { ExternalLink, MessageSquare, Heart } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PlatformIcon } from '@/components/platform-icon'
import { statusConfig, type Shop } from '@/lib/data'
import { BACKEND_URL } from '@/lib/api'

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

export function ShopCard({ shop }: { shop: Shop }) {
  const [isFavorited, setIsFavorited] = useState((shop as any).is_favorited || false)
  const [loadingFav, setLoadingFav] = useState(false)

  async function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setLoadingFav(true)
    try {
      const csrfRes = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      
      const res = await fetch(`${BACKEND_URL}/api/shops/${shop.id}/toggle_favorite/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include'
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsFavorited(data.status === 'favorited')
      } else if (res.status === 401 || res.status === 403) {
        alert('กรุณาเข้าสู่ระบบเพื่อบันทึกเคสเตือนภัยที่สนใจ')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingFav(false)
    }
  }

  // 1. ซ่อม Status
  const rawStatus = (shop.status || 'safe').toLowerCase()
  const normalizedStatus = rawStatus === 'pending' ? 'watch' : rawStatus === 'scam' ? 'caution' : rawStatus
  const status = statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig['safe'] || {
    label: 'รอตรวจสอบ',
    className: 'bg-gray-100 text-gray-700',
    dotClassName: 'bg-gray-400'
  }

  // 2. ซ่อม Platform
  const getPlatformName = (p: string) => {
    if (!p) return 'Other'
    const lower = p.toLowerCase()
    if (lower.includes('facebook')) return 'Facebook'
    if (lower.includes('instagram')) return 'Instagram'
    if (lower.includes('twitter') || lower === 'x') return 'X (Twitter)'
    return p.charAt(0).toUpperCase() + p.slice(1)
  }
  const platformName = getPlatformName(shop.platform)
  const platformStyles = {
    Facebook: 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400',
    Instagram: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-400',
    'X (Twitter)': 'border-border bg-muted text-muted-foreground',
  }[platformName] || 'border-border bg-muted text-muted-foreground'

  // 3. ซ่อมรูปภาพ: รองรับทั้งรูปใน public/media/shops (โหลดเร็วทั้งบน Local และ Vercel) และรูปที่อัปโหลดเข้า Backend
  const fallbackImage = '/media/shops/antiscam_photo_1.jpg'
  let imageUrl = fallbackImage
  if (shop.image) {
    const rawImg = String(shop.image).replace('http://hiuhiu-backend.onrender.com', 'https://hiuhiu-backend.onrender.com')
    const matchBuiltin = rawImg.match(/antiscam_(?:photo|case)_[0-9]+(?:_v2)?\.(?:jpg|png)$/i)
    if (matchBuiltin) {
      imageUrl = `/media/shops/${matchBuiltin[0]}`
    } else {
      imageUrl = rawImg.startsWith('http') ? rawImg : `${BACKEND_URL}${rawImg}`
    }
  }

  // 4. ซ่อมลิงก์: ดึงข้อมูลจาก shop.url (ของ Django) หรือ shop.link (ของเก่า)
  // ใช้ (shop as any) เพื่อไม่ให้ TypeScript บ่นเวลาหาฟิลด์ url ไม่เจอในไฟล์ Type เดิม
  const externalUrl = (shop as any).url || shop.link || ''
  const hasValidExternalUrl = isValidExternalUrl(externalUrl)
  const targetUrl = hasValidExternalUrl ? externalUrl : `/shop/${shop.id}`

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={shop.name || 'ไม่มีชื่อร้าน'}
          className="size-full object-cover"
          onError={(event) => {
            const image = event.currentTarget
            if (image.src.endsWith(fallbackImage)) return
            image.src = fallbackImage
          }}
        />
        <button
          onClick={toggleFavorite}
          disabled={loadingFav}
          className="absolute left-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-white shadow-md border border-gray-200 transition hover:scale-110 disabled:opacity-50 dark:bg-zinc-900/80 dark:border-zinc-700"
          title="บันทึกเคสเตือนภัยนี้ไว้ดู"
        >
          <Heart className={`size-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-gray-600 dark:text-gray-300'}`} />
        </button>
        <span
          className={`absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm ${status.className}`}
        >
          <span className={`size-1.5 rounded-full ${status.dotClassName}`} />
          {status.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <a href={`/shop/${shop.id}`} className="inline-block font-display text-base font-semibold leading-snug text-foreground text-pretty hover:text-primary">
            {shop.name || 'ไม่มีชื่อเคสเตือนภัย'}
          </a>
          <span className={`ml-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${platformStyles}`}>
            <PlatformIcon platform={platformName as any} className="size-3.5" />
            {platformName}
          </span>
        </div>
        
        {/* Comment Count */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MessageSquare className="size-3.5 text-primary" />
          <span className="font-medium text-foreground">
            {(shop as any).review_count > 0
              ? `${(shop as any).review_count} ความคิดเห็นเตือนภัย`
              : 'ยังไม่มีความคิดเห็น'}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
          {(shop.description || 'ไม่มีคำอธิบายสำหรับเคสเตือนภัยนี้')
            .replace(/\s*\[Tags:[^\]]*\]/gi, '')
            .split('---STEPS---')[0]
            .trim()}
        </p>
        <a
          href={`/shop/${shop.id}`}
          className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          อ่านวิธีสังเกต & ป้องกัน
        </a>
      </div>
    </article>
  )
}