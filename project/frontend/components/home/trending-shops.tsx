'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { BACKEND_URL } from '@/lib/api'
import { ShopCard } from '@/components/shop-card'
import { Flame, ArrowRight } from 'lucide-react'

export function TrendingShops() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/shops/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : data.results || []
        const sorted = [...arr].sort((a: any, b: any) => {
          if ((b.average_rating || 0) !== (a.average_rating || 0)) {
            return (b.average_rating || 0) - (a.average_rating || 0)
          }
          return (b.review_count || 0) - (a.review_count || 0)
        })
        setShops(sorted.slice(0, 4))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || shops.length === 0) return null

  return (
    <section className="mb-12 mt-12 w-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-950/30 dark:text-red-500">
            <Flame className="size-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              เคสกลโกงระบาดหนักที่ต้องระวัง (Trending Scam Alerts)
            </h2>
            <p className="text-xs text-muted-foreground">
              รวบรวมรูปแบบกลโกงรอบตัวที่คนมักตกเป็นเหยื่อ กดเข้าไปอ่านวิธีสังเกตและแชร์ประสบการณ์เตือนภัยได้
            </p>
          </div>
        </div>
        <Link
          href="/shops"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          ดูคลังเคสกลโกงทั้งหมด
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shops.map(shop => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </section>
  )
}
