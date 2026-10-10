'use client'

import { useState, useEffect } from 'react'
import { BACKEND_URL } from '@/lib/api'
import { ShopCard } from '@/components/shop-card'
import { Flame } from 'lucide-react'

export function TrendingShops() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/shops/`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const arr = Array.isArray(data) ? data : data.results || []
        // เอาร้านที่ปลอดภัยหรือรอดำเนินการ ที่มีดาว > 0
        const topShops = arr.filter(s => s.status !== 'scam' && s.average_rating > 0)
        topShops.sort((a: any, b: any) => {
           if (b.average_rating !== a.average_rating) return b.average_rating - a.average_rating;
           return b.review_count - a.review_count;
        })
        setShops(topShops.slice(0, 4))
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading || shops.length === 0) return null

  return (
    <section className="mb-12 mt-12 w-full">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-950/30 dark:text-orange-500">
          <Flame className="size-5" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground">ร้านค้าแนะนำยอดฮิต (Top Rated)</h2>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {shops.map(shop => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </div>
    </section>
  )
}
