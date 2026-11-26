'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Loader2, AlertOctagon, Eye, ShieldCheck, Search, Heart } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ShopReviews } from '@/components/shop/shop-reviews'
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
  is_favorited?: boolean
}

const statusLabels = {
  safe: { label: 'แนวทางป้องกัน', className: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-500/30' },
  pending: { label: 'เฝ้าระวังระบาด', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border border-yellow-500/30' },
  scam: { label: 'อันตรายสูง (ระบาดหนัก)', className: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-500/30' },
}

function platformName(value: string) {
  if (value === 'instagram') return 'Instagram'
  if (value === 'x_twitter') return 'X (Twitter)'
  return 'Facebook'
}

function parseDossier(rawDescription: string | null) {
  const cleaned = (rawDescription || '').replace(/\s*\[Tags:[^\]]*\]/gi, '').trim()
  const [summaryPart, rest1] = cleaned.split('---STEPS---')
  const [stepsPart, rest2] = (rest1 || '').split('---REDFLAGS---')
  const [redFlagsPart, preventionPart] = (rest2 || '').split('---PREVENTION---')

  const toLines = (text?: string) =>
    (text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

  return {
    summary: summaryPart?.trim() || 'ยังไม่มีรายละเอียดสรุปสำหรับเคสนี้',
    steps: toLines(stepsPart),
    redFlags: toLines(redFlagsPart),
    preventions: toLines(preventionPart),
  }
}

export default function ShopDetailPage() {
  const params = useParams<{ id: string }>()
  const [shop, setShop] = useState<Shop | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/shops/${params.id}/`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          setNotFound(true)
          return
        }
        const data = await response.json()
        setShop(data)
        setIsFavorited(Boolean(data.is_favorited))
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false))
  }, [params.id])

  async function toggleFavorite() {
    if (!shop) return
    setLoadingFav(true)
    try {
      const csrfRes = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()
      const res = await fetch(`${BACKEND_URL}/api/shops/${shop.id}/toggle_favorite/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
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

  const normalizedPlatform = shop ? platformName(shop.platform) : 'Facebook'
  const status = shop ? statusLabels[shop.status] : statusLabels.pending
  const fallbackImage = '/media/shops/antiscam_photo_1.jpg'
  let imageUrl = fallbackImage
  if (shop?.image) {
    const rawImg = String(shop.image).replace('http://hiuhiu-backend.onrender.com', 'https://hiuhiu-backend.onrender.com')
    const matchBuiltin = rawImg.match(/antiscam_(?:photo|case)_[0-9]+(?:_v2)?\.(?:jpg|png)$/i)
    if (matchBuiltin) {
      imageUrl = `/media/shops/${matchBuiltin[0]}`
    } else {
      imageUrl = rawImg.startsWith('http') ? rawImg : `${BACKEND_URL}${rawImg}`
    }
  }

  const dossier = parseDossier(shop?.description || null)

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-8">
        {isLoading ? (
          <div className="flex w-full items-center justify-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            กำลังโหลดแฟ้มข้อมูลเคสเตือนภัย...
          </div>
        ) : notFound || !shop ? (
          <div className="w-full rounded-3xl border border-dashed border-border bg-card py-20 text-center">
            <h1 className="font-display text-xl font-bold text-foreground">ไม่พบข้อมูลเคสเตือนภัยนี้</h1>
            <Link href="/shops" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="size-4" />
              กลับไปหน้าคลังเคสกลโกงทั้งหมด
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
                    ช่องทางที่พบการระบาดบ่อย:
                    <PlatformIcon platform={normalizedPlatform as 'Facebook' | 'Instagram' | 'X (Twitter)'} className="size-4" />
                    <span className="font-medium text-foreground">{normalizedPlatform}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleFavorite}
                    disabled={loadingFav}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                      isFavorited
                        ? 'border-red-500/40 bg-red-500/10 text-red-500'
                        : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Heart className={`size-3.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorited ? 'บันทึกเคสนี้แล้ว' : 'บันทึกเคสไว้ดู'}
                  </button>
                  <span className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              {/* ภาพรวมของกลโกง */}
              <div className="mt-6 rounded-2xl border border-border bg-secondary/30 p-5">
                <h2 className="text-sm font-bold text-foreground mb-2">📌 สรุปพฤติกรรมกลโกงเคสนี้:</h2>
                <p className="whitespace-pre-line leading-relaxed text-muted-foreground text-sm sm:text-base">
                  {dossier.summary}
                </p>
              </div>

              {/* แฟ้มวิเคราะห์กลโกง 3 กล่อง (แสดงเมื่อมีข้อมูลวิเคราะห์ หรือแสดงคำแนะนำมาตรฐาน) */}
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {/* กล่องที่ 1: ขั้นตอนที่มิจฉาชีพใช้หลอก */}
                <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-3">
                    <AlertOctagon className="size-4 shrink-0" />
                    <span>1. ลำดับขั้นตอนที่มิจฉาชีพใช้หลอก</span>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {(dossier.steps.length > 0
                      ? dossier.steps
                      : [
                          'สร้างโปรไฟล์หรือเพจปลอม นำรูปสินค้า/หลักฐานของคนอื่นมาโพสต์ในราคาถูกกว่าปกติ',
                          'อ้างว่ามีคนรอคิวต่อเยอะ หรือเป็นดีลหลุดจอง เพื่อเร่งให้เหยื่อรีบตัดสินใจโอนเงินมัดจำ',
                          'เมื่อโอนเงินเข้าบัญชีม้าแล้ว จะอ้างให้โอนเพิ่มหรือทำการบล็อกช่องทางติดต่อหนีทันที',
                        ]
                    ).map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-600/20 text-[11px] font-bold text-red-500">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* กล่องที่ 2: จุดสังเกตจับโป๊ะ (Red Flags) */}
                <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm mb-3">
                    <Eye className="size-4 shrink-0" />
                    <span>2. จุดสังเกตจับโป๊ะ (Red Flags)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {(dossier.redFlags.length > 0
                      ? dossier.redFlags
                      : [
                          'ชื่อบัญชีธนาคารที่ให้โอน ไม่ตรงกับชื่อโปรไฟล์ผู้ขาย (อ้างว่าเป็นบัญชีแฟน/ญาติ)',
                          'ปฏิเสธการนัดรับสินค้า และไม่ยอมวิดีโอคอลให้ดูสินค้าจริงแบบสดๆ',
                          'เพจหรือบัญชีเพิ่งสร้างใหม่ มีการเปลี่ยนชื่อมาหลายครั้ง หรือปิดกั้นคอมเมนต์',
                        ]
                    ).map((flag, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* กล่องที่ 3: วิธีป้องกันตัว & เช็กก่อนโอน */}
                <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-3">
                    <ShieldCheck className="size-4 shrink-0" />
                    <span>3. วิธีป้องกันตัว & รับมือ</span>
                  </div>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {(dossier.preventions.length > 0
                      ? dossier.preventions
                      : [
                          'นำชื่อ-นามสกุลเจ้าของบัญชีและเลขบัญชี ไปค้นหาในระบบตรวจสอบประวัติคนโกงหน้าแรกก่อนโอนเสมอ',
                          'ขอให้ผู้ขายเขียนชื่อคุณและวันที่ปัจจุบันลงกระดาษ วางคู่กับสินค้าจริงแล้วถ่ายรูป/วิดีโอคอล',
                          'หากโอนเงินไปแล้วพบความผิดปกติ ให้รีบโทรสายด่วน AOC 1441 เพื่ออายัดบัญชีทันที',
                        ]
                    ).map((prev, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>{prev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <Link href="/shops" className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-5 text-sm font-medium text-foreground hover:bg-muted">
                  <ArrowLeft className="size-4" />
                  กลับไปหน้าคลังเคสกลโกงทั้งหมด
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                >
                  <Search className="size-4" />
                  ไปหน้าตรวจสอบชื่อ/เลขบัญชีคนโกง & สแกนข้อความแชท
                </Link>
              </div>
            </div>
            
            {/* Review Section */}
            <div className="border-t border-border bg-secondary/20 p-6 sm:p-8">
              <ShopReviews shopId={shop.id.toString()} />
            </div>
          </article>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
