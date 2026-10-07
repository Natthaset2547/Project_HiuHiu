'use client'

import { useState } from 'react'
import { ShieldCheck, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { statusConfig, type ShopStatus } from '@/lib/data'

type Result = { status: ShopStatus; name: string } | null

export function VerifyLink() {
  const [value, setValue] = useState('')
  const [result, setResult] = useState<Result>(null)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = value.trim()
    if (!url) return
    // ตรวจสอบจำลอง: ให้สถานะจากลักษณะของลิงก์
    let status: ShopStatus = 'watch'
    if (/facebook|instagram|shopee|lazada/i.test(url)) status = 'safe'
    if (/bit\.ly|tinyurl|free|promo|winner/i.test(url)) status = 'caution'
    setResult({ status, name: url.replace(/^https?:\/\//, '').slice(0, 48) })
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            ตรวจสอบประวัติร้านค้า
          </h2>
          <p className="text-sm text-muted-foreground">
            วางลิงก์ร้านค้าที่สงสัยเพื่อตรวจสอบสถานะความปลอดภัย
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="วางลิงก์ร้านค้า (Facebook, IG, X) ที่นี่เพื่อตรวจสอบ..."
            className="h-12 w-full rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm outline-none transition focus:border-primary focus:bg-background focus:ring-2 focus:ring-ring/25"
            aria-label="ลิงก์ร้านค้า"
          />
        </div>
        <Button type="submit" className="h-12 rounded-xl px-8 text-sm">
          ตรวจสอบลิงก์
        </Button>
      </form>

      {result && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
          <span className="text-muted-foreground">ผลการตรวจสอบ:</span>
          <span className="font-medium text-foreground">{result.name}</span>
          <span
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusConfig[result.status].className}`}
          >
            <span className={`size-1.5 rounded-full ${statusConfig[result.status].dotClassName}`} />
            {statusConfig[result.status].label}
          </span>
        </div>
      )}
    </section>
  )
}
