'use client'

import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal, Loader2 } from 'lucide-react'
import { ShopCard } from '@/components/shop-card'
import { PlatformIcon } from '@/components/platform-icon'
import type { Platform } from '@/lib/data'
import { BACKEND_URL } from '@/lib/api'

const platforms: Platform[] = ['Facebook', 'Instagram', 'X (Twitter)']

// สร้างพจนานุกรมคำค้นหา 
const keywordMap: Record<string, string[]> = {
  'แฟชั่น': ['เสื้อผ้า', 'เสื้อ', 'แฟชั่น', 'fashion', 'shirt', 'กางเกง', 'เดรส', 'หมวก', 'เครื่องประดับ', 'สร้อย', 'แหวน', 'นาฬิกา', 'jewelry', 'แต่งกาย', 'ชุด', 'รองเท้า', 'shoes', 'shoe', 'sneaker', 'ผ้าใบ', 'คอมแบท'], 
  'สกินแคร์': ['สกินแคร์', 'เครื่องสำอาง', 'cosmetic', 'skincare', 'skin', 'ครีม', 'แต่งหน้า', 'เมคอัพ', 'ความงาม', 'บำรุงผิว'],
  'กระเป๋า': ['กระเป๋า', 'bag', 'เป้', 'สะพาย', 'ถุงผ้า', 'wallet', 'กระเป๋าสตางค์'], 
  'art toy': ['art toy', 'arttoy', 'ของเล่น', 'toy', 'กล่องสุ่ม', 'ฟิกเกอร์', 'โมเดล', 'ตุ๊กตา', 'popmart'],
  'ของใช้': ['ของใช้', 'แก้ว', 'แก้วน้ำ', 'กระติก', 'ไลฟ์สไตล์', 'จิปาถะ', 'ตกแต่งห้อง', 'เครื่องเขียน'],
  'ของกิน': ['ของกิน', 'อาหาร', 'food', 'ขนม', 'อร่อย', 'เบเกอรี่'],
  'k-pop': ['k-pop', 'j-pop', 'kpop', 'ติ่ง', 'อัลบั้ม', 'การ์ด', 'คอนเสิร์ต', 'ศิลปิน', 'แฟนคลับ'],
  'ร้านค้า': ['ร้านค้า', 'พรีออเดอร์', 'preorder', 'pre-order', 'หิ้ว', 'รับกด', 'สั่งของ']
}

export function SearchClient({ query = '' }: { query?: string }) {
  const [active, setActive] = useState<Platform[]>([])
  const [shops, setShops] = useState<any[]>([]) 
  const [isLoading, setIsLoading] = useState(true) 
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/shops/`, { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('โหลดข้อมูลร้านค้าไม่สำเร็จ')
        return res.json()
      })
      .then((data) => {
        setShops(data) 
        setIsLoading(false) 
      })
      .catch((error) => {
        console.error('พังจ้า โหลดข้อมูลไม่ได้:', error)
        setLoadError('ไม่สามารถโหลดข้อมูลร้านค้าได้ กรุณาลองใหม่อีกครั้ง')
        setIsLoading(false)
      })
  }, [])

  function toggle(platform: Platform) {
    setActive((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
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

  // ระบบกรองข้อมูล
  const results = useMemo(() => {
    return shops.filter((shop) => {
      const normalizedPlatform = getPlatformName(shop.platform)
      const matchPlatform = active.length === 0 || active.includes(normalizedPlatform as Platform)
      
      // ถ้าไม่มีการค้นหาอะไรเลย ก็ให้โชว์ทุกร้านที่ผ่านฟิลเตอร์แพลตฟอร์ม
      if (!query) return matchPlatform

      // แปลงคำค้นหาเป็นตัวเล็ก
      const lowerQuery = query.trim().toLowerCase()
      
      // ดึงกลุ่มคำจากพจนานุกรม 
      const searchTerms = (keywordMap[lowerQuery] || [lowerQuery]).map((term) => term.toLowerCase())

      if (lowerQuery === 'ทั้งหมด') return matchPlatform
      
      const shopName = (shop.name || '').toLowerCase()
      const shopDesc = (shop.description || '').toLowerCase()

      // เช็คว่ามี "คำไหนสักคำ" ในกลุ่ม ไปตรงกับชื่อร้าน หรือ คำอธิบายร้านไหม
      const matchQuery = searchTerms.some(term => 
        shopName.includes(term) || shopDesc.includes(term)
      )
        
      return matchPlatform && matchQuery
    })
  }, [active, query, shops])
  
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <aside className="lg:w-60 lg:shrink-0">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-20">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="size-4 text-primary" />
            <h2 className="font-display text-base font-semibold text-foreground">ตัวกรอง</h2>
          </div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">แพลตฟอร์ม</p>
          <div className="space-y-1">
            {platforms.map((platform) => {
              const checked = active.includes(platform)
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
              }[platform]
              return (
                <label
                  key={platform}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-2.5 py-2 text-sm transition hover:brightness-95 ${platformStyles}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(platform)}
                    className="size-4 accent-current"
                  />
                  <PlatformIcon platform={platform} className="size-4" />
                  <span>{platform}</span>
                </label>
              )
            })}
          </div>
          {active.length > 0 && (
            <button
              type="button"
              onClick={() => setActive([])}
              className="mt-4 text-xs font-medium text-primary hover:underline"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </aside>

      <section className="flex-1">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">ร้านค้าทั้งหมด</h1>
            {query && (
              <p className="text-sm text-muted-foreground">ผลการค้นหาสำหรับ “{query}”</p>
            )}
          </div>
          <span className="text-sm text-muted-foreground">พบ {results.length} รายการ</span>
        </div>

        {isLoading ? (
          <div className="flex h-60 items-center justify-center rounded-2xl border border-dashed border-border bg-card">
            <Loader2 className="size-8 animate-spin text-primary/50" />
            <span className="ml-3 text-muted-foreground">กำลังดึงข้อมูลจากหลังบ้าน...</span>
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
              ไม่พบร้านค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหาใหม่
            </p>
          </div>
        )}
      </section>
    </div>
  )
}