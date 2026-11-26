'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, Loader2, PlusCircle, X, ImagePlus } from 'lucide-react'
import { ShopCard } from '@/components/shop-card'
import { PlatformIcon } from '@/components/platform-icon'
import { Button } from '@/components/ui/button'
import type { Platform } from '@/lib/data'
import { BACKEND_URL } from '@/lib/api'

const platforms: Platform[] = ['Facebook', 'Instagram', 'X (Twitter)']

const SEVERITY_FILTERS: { value: 'scam' | 'pending' | 'safe'; label: string; dotClass: string; badgeClass: string }[] = [
  {
    value: 'scam',
    label: 'อันตรายสูง (ระบาดหนัก)',
    dotClass: 'bg-red-500',
    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-400',
  },
  {
    value: 'pending',
    label: 'เฝ้าระวังระบาด',
    dotClass: 'bg-yellow-500',
    badgeClass: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  },
  {
    value: 'safe',
    label: 'แจ้งเตือนทั่วไป',
    dotClass: 'bg-green-500',
    badgeClass: 'border-green-500/40 bg-green-500/10 text-green-400',
  },
]

const SIDEBAR_CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'ทั้งหมด', label: 'ทั้งหมด' },
  { slug: 'k-pop', label: 'บัตรคอน / K-Pop' },
  { slug: 'art toy', label: 'พรีออเดอร์ / Art Toy' },
  { slug: 'ของใช้', label: 'เช่าหอพัก / มือถือ' },
  { slug: 'ร้านค้า', label: 'งานเสริม / SMS ลิงก์ปลอม' },
  { slug: 'แฟชั่น', label: 'เสื้อผ้า / รองเท้า' },
  { slug: 'สกินแคร์', label: 'สกินแคร์ / ครีมปลอม' },
  { slug: 'กระเป๋า', label: 'กระเป๋า / แบรนด์เนม' },
  { slug: 'ของกิน', label: 'คูปองอาหาร / วอยเชอร์' },
]

const CATEGORY_OPTIONS = [
  { value: 'k-pop บัตรคอน คอนเสิร์ต ศิลปิน', label: 'หลอกขายบัตรคอนเสิร์ต / K-Pop' },
  { value: 'art toy ของเล่น กล่องสุ่ม พรีออเดอร์', label: 'หลอกพรีออเดอร์ / Art Toy' },
  { value: 'ของใช้ หอพัก เช่าหอ คอนโด ไอแพด มือถือ', label: 'หลอกเช่าหอพัก / ของใช้ / มือถือ' },
  { value: 'ร้านค้า งานเสริม พาร์ทไทม์ ปั่นออเดอร์ คอลเซ็นเตอร์ sms', label: 'งานเสริมทิพย์ / คอลเซ็นเตอร์ / SMS' },
  { value: 'แฟชั่น เสื้อผ้า รองเท้า sneaker', label: 'หลอกขายเสื้อผ้า / แฟชั่น / รองเท้า' },
  { value: 'สกินแคร์ เครื่องสำอาง ครีม ปลอม', label: 'สกินแคร์ปลอม / ครีมทิพย์' },
  { value: 'กระเป๋า แบรนด์เนม มือสอง', label: 'หลอกขายกระเป๋า / แบรนด์เนม' },
  { value: 'ของกิน อาหาร คูปอง บุฟเฟต์ วอยเชอร์', label: 'หลอกสั่งอาหาร / คูปองทิพย์' },
]

// สร้างพจนานุกรมคำค้นหา 
const keywordMap: Record<string, string[]> = {
  'แฟชั่น': ['เสื้อผ้า', 'เสื้อ', 'แฟชั่น', 'fashion', 'shirt', 'กางเกง', 'เดรส', 'หมวก', 'เครื่องประดับ', 'รองเท้า', 'sneaker', 'ผ้าใบ'], 
  'สกินแคร์': ['สกินแคร์', 'เครื่องสำอาง', 'cosmetic', 'skincare', 'ครีม', 'แต่งหน้า', 'เมคอัพ', 'ความงาม', 'บำรุงผิว', 'ปลอม'],
  'กระเป๋า': ['กระเป๋า', 'bag', 'แบรนด์เนม', 'เป้', 'สะพาย', 'ถุงผ้า', 'wallet', 'กระเป๋าสตางค์', 'มือสอง'], 
  'art toy': ['art toy', 'arttoy', 'ของเล่น', 'toy', 'กล่องสุ่ม', 'ฟิกเกอร์', 'โมเดล', 'ตุ๊กตา', 'popmart', 'พรีออเดอร์'],
  'ของใช้': ['ของใช้', 'หอพัก', 'เช่าหอ', 'คอนโด', 'สัญญาเช่า', 'มัดจำหอ', 'แก้ว', 'ไอแพด', 'มือถือ', 'จิปาถะ'],
  'ของกิน': ['ของกิน', 'อาหาร', 'food', 'ขนม', 'คูปอง', 'บุฟเฟต์', 'วอยเชอร์'],
  'k-pop': ['k-pop', 'j-pop', 'kpop', 'ติ่ง', 'อัลบั้ม', 'การ์ด', 'คอนเสิร์ต', 'บัตรคอน', 'ศิลปิน', 'แฟนคลับ', 'รับกดบัตร'],
  'ร้านค้า': ['งานเสริม', 'พาร์ทไทม์', 'ปั่นออเดอร์', 'คอลเซ็นเตอร์', 'sms', 'ลิงก์ปลอม', 'บัญชีม้า', 'กู้เงิน', 'พรีออเดอร์']
}

export function SearchClient({ query = '' }: { query?: string }) {
  const router = useRouter()
  const [active, setActive] = useState<Platform[]>([])
  const [activeSeverities, setActiveSeverities] = useState<('scam' | 'pending' | 'safe')[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>(query || 'ทั้งหมด')
  const [shops, setShops] = useState<any[]>([]) 
  const [isLoading, setIsLoading] = useState(true) 
  const [loadError, setLoadError] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    setSelectedCategory(query || 'ทั้งหมด')
  }, [query])

  // Modal state for creating a new scam alert case thread
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [platform, setPlatform] = useState<'facebook' | 'instagram' | 'x_twitter'>('facebook')
  const [categoryTags, setCategoryTags] = useState(CATEGORY_OPTIONS[0].value)
  const [severity, setSeverity] = useState<'scam' | 'pending' | 'safe'>('scam')
  const [summary, setSummary] = useState('')
  const [stepsText, setStepsText] = useState('')
  const [redFlagsText, setRedFlagsText] = useState('')
  const [preventionText, setPreventionText] = useState('')
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setCurrentUser(data.user)
        }
      })
      .catch(() => {})

    fetch(`${BACKEND_URL}/api/shops/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('โหลดข้อมูลเคสเตือนภัยไม่สำเร็จ')
        return res.json()
      })
      .then((data) => {
        setShops(data) 
        setIsLoading(false) 
      })
      .catch((error) => {
        console.error('โหลดข้อมูลไม่ได้:', error)
        setLoadError('ไม่สามารถโหลดข้อมูลเคสเตือนภัยได้ กรุณาลองใหม่อีกครั้ง')
        setIsLoading(false)
      })
  }, [])

  function toggle(p: Platform) {
    setActive((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p],
    )
  }

  function toggleSeverity(sev: 'scam' | 'pending' | 'safe') {
    setActiveSeverities((prev) =>
      prev.includes(sev) ? prev.filter((item) => item !== sev) : [...prev, sev],
    )
  }

  const getPlatformName = (p: string) => {
    if (!p) return 'Other'
    const lower = p.toLowerCase()
    if (lower.includes('facebook')) return 'Facebook'
    if (lower.includes('instagram')) return 'Instagram'
    if (lower.includes('twitter') || lower === 'x') return 'X (Twitter)'
    return p.charAt(0).toUpperCase() + p.slice(1)
  }

  async function handleCreateThread(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !summary.trim()) {
      setSubmitError('กรุณากรอกหัวข้อและสรุปพฤติกรรมกลโกง')
      return
    }
    setSubmitting(true)
    setSubmitError('')

    try {
      const csrfRes = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()

      let fullDesc = summary.trim()
      if (stepsText.trim() || redFlagsText.trim() || preventionText.trim()) {
        fullDesc += `\n---STEPS---\n${stepsText.trim()}\n---REDFLAGS---\n${redFlagsText.trim()}\n---PREVENTION---\n${preventionText.trim()}`
      }
      fullDesc += `\n[Tags: ${categoryTags}]`

      const formData = new FormData()
      formData.append('name', title.trim())
      formData.append('platform', platform)
      formData.append('status', severity)
      formData.append('description', fullDesc)
      formData.append('url', `https://hiuhiu.local/case-${Date.now()}`)
      if (coverImage) {
        formData.append('image', coverImage)
      }

      const res = await fetch(`${BACKEND_URL}/api/shops/`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
        body: formData,
      })
      const created = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(created.detail || created.error || 'สร้างกระทู้เตือนภัยไม่สำเร็จ')
      }

      setShops((prev) => [created, ...prev])
      setIsModalOpen(false)
      setTitle('')
      setSummary('')
      setStepsText('')
      setRedFlagsText('')
      setPreventionText('')
      setCoverImage(null)
    } catch (err: any) {
      setSubmitError(err.message || 'เกิดข้อผิดพลาดในการสร้างกระทู้')
    } finally {
      setSubmitting(false)
    }
  }

  const results = useMemo(() => {
    return shops.filter((shop) => {
      const normalizedPlatform = getPlatformName(shop.platform)
      const matchPlatform = active.length === 0 || active.includes(normalizedPlatform as Platform)

      const rawStatus = (shop.status || 'safe').toLowerCase()
      const matchSeverity =
        activeSeverities.length === 0 || activeSeverities.includes(rawStatus as 'scam' | 'pending' | 'safe')

      const activeQuery = (selectedCategory || '').trim().toLowerCase()
      if (!activeQuery || activeQuery === 'ทั้งหมด') {
        return matchPlatform && matchSeverity
      }

      const searchTerms = (keywordMap[activeQuery] || [activeQuery]).map((term) => term.toLowerCase())
      const shopName = (shop.name || '').toLowerCase()
      const shopDesc = (shop.description || '').toLowerCase()

      const matchQuery = searchTerms.some((term) => shopName.includes(term) || shopDesc.includes(term))

      return matchPlatform && matchSeverity && matchQuery
    })
  }, [active, activeSeverities, selectedCategory, shops])
  
  return (
    <>
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-64 lg:shrink-0">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-20 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <h2 className="font-display text-base font-semibold text-foreground">ตัวกรองเคสกลโกง</h2>
            </div>
            {(active.length > 0 || activeSeverities.length > 0 || (selectedCategory && selectedCategory !== 'ทั้งหมด')) && (
              <button
                type="button"
                onClick={() => {
                  setActive([])
                  setActiveSeverities([])
                  setSelectedCategory('ทั้งหมด')
                }}
                className="text-xs font-medium text-primary hover:underline"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {/* 1. กรองตามระดับความรุนแรง */}
          <div>
            <p className="mb-2.5 text-xs font-semibold text-muted-foreground">ระดับความรุนแรง / ประเภท</p>
            <div className="space-y-1.5">
              {SEVERITY_FILTERS.map((sev) => {
                const checked = activeSeverities.includes(sev.value)
                return (
                  <label
                    key={sev.value}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition ${
                      checked
                        ? sev.badgeClass
                        : 'border-border bg-secondary/20 text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSeverity(sev.value)}
                      className="size-3.5 accent-current"
                    />
                    <span className={`size-2 rounded-full ${sev.dotClass}`} />
                    <span>{sev.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 2. กรองตามแพลตฟอร์ม */}
          <div className="border-t border-border pt-4">
            <p className="mb-2.5 text-xs font-semibold text-muted-foreground">แพลตฟอร์มที่พบการหลอกลวง</p>
            <div className="space-y-1.5">
              {platforms.map((p) => {
                const checked = active.includes(p)
                const platformStyles = {
                  Facebook: checked
                    ? 'border-blue-500 bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200 dark:border-blue-500'
                    : 'border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300 dark:border-blue-700',
                  Instagram: checked
                    ? 'border-purple-500 bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-200 dark:border-purple-500'
                    : 'border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-900/25 dark:text-purple-300 dark:border-purple-700',
                  'X (Twitter)': checked
                    ? 'border-gray-500 bg-gray-200 text-gray-900 dark:bg-gray-700/60 dark:text-gray-100 dark:border-gray-500'
                    : 'border-gray-300 bg-gray-100 text-gray-700 dark:bg-gray-700/25 dark:text-gray-300 dark:border-gray-600',
                }[p]
                return (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-xs font-medium transition hover:brightness-95 ${platformStyles}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p)}
                      className="size-3.5 accent-current"
                    />
                    <PlatformIcon platform={p} className="size-4" />
                    <span>{p}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* 3. กรองตามหมวดหมู่กลโกง */}
          <div className="border-t border-border pt-4">
            <p className="mb-2.5 text-xs font-semibold text-muted-foreground">หมวดหมู่กลโกงรอบตัว</p>
            <div className="flex flex-wrap gap-1.5">
              {SIDEBAR_CATEGORIES.map((cat) => {
                const isSelected =
                  (selectedCategory || 'ทั้งหมด').toLowerCase() === cat.slug.toLowerCase()
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </aside>

      <section className="flex-1">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">คลังเคสเตือนภัยกลโกงรอบตัว</h1>
            {query ? (
              <p className="text-sm text-muted-foreground">ผลการค้นหาเคสกลโกงสำหรับ “{query}” (พบ {results.length} เคส)</p>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground">
                กดเข้าไปอ่านแฟ้มวิเคราะห์กลโกง 3 ขั้นตอน หรือตั้งกระทู้แชร์กลโกงที่คุณเจอเพื่อเตือนภัยเพื่อนๆ (พบ {results.length} เคส)
              </p>
            )}
          </div>
          <Button
            type="button"
            onClick={() => {
              if (!currentUser) {
                alert('กรุณาเข้าสู่ระบบก่อนตั้งกระทู้แชร์เคสเตือนภัยครับ')
                router.push('/login')
                return
              }
              setIsModalOpen(true)
            }}
            className="rounded-xl gap-2 h-10 px-4 font-semibold shadow-sm"
          >
            <PlusCircle className="size-4" />
            ตั้งกระทู้แชร์เคสกลโกงที่คุณเจอ
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
            <Loader2 className="size-8 animate-spin text-primary/50" />
            <span className="ml-3 text-muted-foreground">กำลังดึงข้อมูลเคสเตือนภัย...</span>
          </div>
        ) : loadError ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-danger/30 bg-card py-20 text-center">
            <p className="text-sm text-danger-foreground">{loadError}</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-3 text-xs font-medium text-primary hover:underline">
              ลองโหลดใหม่
            </button>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <p className="text-sm text-muted-foreground">
              ไม่พบเคสกลโกงที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหาใหม่
            </p>
          </div>
        )}
      </section>
    </div>

    {/* Modal ตั้งกระทู้แชร์เคสกลโกง */}
    {isModalOpen && (
      <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-12 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl mb-12 rounded-3xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border p-5 sm:p-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">✍️ ตั้งกระทู้แชร์เคสกลโกงเตือนภัย</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                แชร์มุกมิจฉาชีพที่คุณเพิ่งเจอ เพื่อให้คนอื่นรู้ทันและเข้ามาแลกเปลี่ยนข้อมูลใต้กระทู้
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleCreateThread} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                หัวข้อเคสเตือนภัยกลโกง *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น เตือนภัย! มุกหลอกปล่อยเช่าหอพักหน้ามอ ให้โอนมัดจำจองห้องด่วน"
                className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  ช่องทางที่พบการระบาด
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="x_twitter">X (Twitter)</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  หมวดหมู่กลโกง
                </label>
                <select
                  value={categoryTags}
                  onChange={(e) => setCategoryTags(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  ระดับความรุนแรง
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="scam">อันตรายสูง (ระบาดหนัก)</option>
                  <option value="pending">เฝ้าระวังระบาด</option>
                  <option value="safe">แจ้งเตือนทั่วไป</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                สรุปเหตุการณ์ / พฤติกรรมการหลอกลวง *
              </label>
              <textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="อธิบายสั้นๆ ว่ามิจฉาชีพมาในรูปแบบไหน หลอกขายหรือหลอกให้ทำอะไร..."
                className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  1. ขั้นตอนที่มันใช้หลอก (บรรทัดละข้อ)
                </label>
                <textarea
                  rows={3}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  placeholder={"โพสต์รูปราคาถูก\nอ้างมีคิวต่อเยอะ\nได้เงินแล้วบล็อกหนี"}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  2. จุดสังเกตจับโป๊ะ (บรรทัดละข้อ)
                </label>
                <textarea
                  rows={3}
                  value={redFlagsText}
                  onChange={(e) => setRedFlagsText(e.target.value)}
                  placeholder={"ชื่อบัญชีไม่ตรงชื่อเฟซ\nไม่ยอมนัดรับหรือคอล\nเร่งให้โอนใน 5 นาที"}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  3. วิธีป้องกันตัว (บรรทัดละข้อ)
                </label>
                <textarea
                  rows={3}
                  value={preventionText}
                  onChange={(e) => setPreventionText(e.target.value)}
                  placeholder={"เช็กชื่อบัญชีในเว็บก่อนโอน\nขอดูของจริงผ่านวิดีโอคอล\nห้ามโอนมัดจำล่วงหน้า"}
                  className="w-full rounded-xl border border-input bg-background p-2.5 text-xs outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                รูปภาพปกหรือรูปตัวอย่างแชท (ถ้าไม่อัปโหลด ระบบจะสร้างปก SCAM ALERT ให้อัตโนมัติ)
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/50">
                <ImagePlus className="size-4" />
                {coverImage ? `เลือกไฟล์แล้ว: ${coverImage.name}` : 'เลือกรูปภาพประกอบ'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {submitError && (
              <p className="rounded-xl bg-danger/10 p-3 text-xs text-danger-foreground">{submitError}</p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                ยกเลิก
              </Button>
              <Button type="submit" disabled={submitting} className="rounded-xl px-6 font-semibold">
                {submitting ? 'กำลังโพสต์กระทู้...' : 'โพสต์กระทู้เตือนภัย'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}
