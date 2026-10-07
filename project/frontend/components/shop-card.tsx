import { ExternalLink } from 'lucide-react'
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

  // 3. ซ่อมรูปภาพ: ถ้าไม่มีรูป ให้ใช้รูป Placeholder จากเว็บแทน จะได้สวยๆ
  let imageUrl = 'https://placehold.co/600x400/eeeeee/999999?text=No+Image'
  if (shop.image) {
    imageUrl = shop.image.startsWith('http') ? shop.image : `${BACKEND_URL}${shop.image}`
  }
  const fallbackImage = '/shops/cosmetics.png'

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
            {shop.name || 'ไม่มีชื่อร้าน'}
          </a>
          <span className={`ml-2 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs ${platformStyles}`}>
            <PlatformIcon platform={platformName as any} className="size-3.5" />
            {platformName}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {shop.description || 'ไม่มีคำอธิบายสำหรับร้านค้านี้'}
        </p>
        <a
          href={targetUrl}
          target={hasValidExternalUrl ? '_blank' : '_self'}
          rel={hasValidExternalUrl ? 'noopener noreferrer' : undefined}
          onClick={(event) => {
            if (!hasValidExternalUrl) {
              event.preventDefault()
            }
          }}
          className={`mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition ${
            hasValidExternalUrl
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'pointer-events-none cursor-default bg-muted text-muted-foreground'
          }`}
        >
          {hasValidExternalUrl ? 'ไปที่ร้านค้า' : 'ดูรายละเอียดร้านค้า'}
          {hasValidExternalUrl && <ExternalLink className="size-4" />}
        </a>
        <a href={`/shop/${shop.id}`} className="text-center text-xs font-medium text-muted-foreground hover:text-primary hover:underline">
          ดูรายละเอียดร้านค้า
        </a>
      </div>
    </article>
  )
}