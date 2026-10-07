'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { PlatformIcon } from '@/components/platform-icon'
import { BACKEND_URL } from '@/lib/api'

type Shop = {
  id: number
  name: string
  url: string
  platform: string
  status: 'safe' | 'pending' | 'scam'
  description: string | null
  image: string | null
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

const statusLabels = {
  safe: { label: 'ปลอดภัย', className: 'bg-green-100 text-green-700' },
  pending: { label: 'กำลังตรวจสอบ', className: 'bg-yellow-100 text-yellow-700' },
  scam: { label: 'มิจฉาชีพ', className: 'bg-red-100 text-red-700' },
}

function platformName(value: string) {
  if (value === 'instagram') return 'Instagram'
  if (value === 'x_twitter') return 'X (Twitter)'
  return 'Facebook'
}

export default function ShopDetailPage() {
  const params = useParams<{ id: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/shops/${params.id}/`)
      .then(async (response) => {
        if (!response.ok) {
          setNotFound(true)
          return
        }
        setShop(await response.json())
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [params.id])

  const normalizedPlatform = shop ? platformName(shop.platform) : 'Facebook'
  const status = shop ? statusLabels[shop.status] : statusLabels.pending
  const isValidShopUrl = shop ? isValidExternalUrl(shop.url) : false
  const imageUrl = shop?.image
    ? shop.image.startsWith('http')
      ? shop.image
      : `${BACKEND_URL}${shop.image}`
    : '/shops/cosmetics.png'

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">
        {isLoading ? (
          <div className="flex w-full items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            กำลังโหลดข้อมูลร้านค้า...
          </div>
        ) : notFound || !shop ? (
          <div className="w-full rounded-3xl border border-dashed border-border bg-card py-20 text-center">
            <h1 className="font-display text-xl font-bold text-foreground">ไม่พบร้านค้านี้</h1>
            <Link href="/shops" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="size-4" />
              กลับไปหน้าร้านค้าทั้งหมด
            </Link>
          </div>
        ) : (
          <article className="w-full overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
            <div className="relative aspect-[3/1] overflow-hidden bg-muted">
              <img src={imageUrl} alt={shop.name} className="size-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-foreground">{shop.name}</h1>
                  <span className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <PlatformIcon platform={normalizedPlatform as 'Facebook' | 'Instagram' | 'X (Twitter)'} className="size-4" />
                    {normalizedPlatform}
                  </span>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <p className="mt-6 whitespace-pre-line leading-relaxed text-muted-foreground">
                {shop.description || 'ร้านค้านี้ยังไม่มีคำอธิบาย'}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-6">
                {isValidShopUrl ? (
                  <a href={shop.url} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    เปิดร้านค้านี้
                    <ExternalLink className="size-4" />
                  </a>
                ) : (
                  <button type="button" disabled className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl bg-muted px-5 text-sm font-medium text-muted-foreground">
                    ลิงก์ร้านค้าไม่ถูกต้อง
                  </button>
                )}
                <Link href="/shops" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-5 text-sm font-medium text-foreground hover:bg-muted">
                  <ArrowLeft className="size-4" />
                  กลับไดเรกทอรี
                </Link>
              </div>
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}