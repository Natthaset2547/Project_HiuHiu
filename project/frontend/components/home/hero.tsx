'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BACKEND_URL } from '@/lib/api'

type Banner = {
  id: number
  title: string
  subtitle: string
  image: string
  link: string
}

const fallbackBanner: Banner = {
  id: 0,
  title: 'รวมร้านรับหิ้วที่ไว้ใจได้',
  subtitle: 'ค้นหาร้านรับหิ้วจากทั่วโลก พร้อมสถานะความน่าเชื่อถือ ก่อนตัดสินใจสั่งซื้อทุกครั้ง',
  image: '/hero-desk.png',
  link: '',
}

export function Hero() {
  const [banners, setBanners] = useState<Banner[]>([fallbackBanner])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/banners/?is_active=true`)
      .then(async (response) => {
        if (!response.ok) return
        const data = await response.json()
        if (data.length > 0) setBanners(data)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, 5000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  const banner = banners[activeIndex] || fallbackBanner
  const isFallback = banner.id === 0
  const imageUrl = banner.image.startsWith('/')
    ? banner.image
    : banner.image.startsWith('http')
      ? banner.image
      : `${BACKEND_URL}${banner.image}`

  function move(step: number) {
    setActiveIndex((current) => (current + step + banners.length) % banners.length)
  }

  return (
    <section className="relative min-h-[300px] overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 md:min-h-[360px]">
      {isFallback ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950 via-blue-700 to-blue-500" />
          <img src={imageUrl} alt="" aria-hidden="true" className="absolute right-0 top-0 hidden h-full w-1/2 object-cover opacity-70 mix-blend-luminosity md:block" />
          <div className="absolute inset-y-0 right-0 hidden w-2/3 bg-gradient-to-r from-blue-800 via-blue-800/35 to-transparent md:block" />
        </>
      ) : (
        <>
          <img src={imageUrl} alt={banner.title || 'แบนเนอร์ HiuHiu'} className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-800/65 to-blue-900/20" />
        </>
      )}
      <div className="relative flex min-h-[300px] flex-col justify-center gap-6 px-6 py-12 sm:px-12 md:min-h-[360px] md:max-w-[62%]">
        <span className="w-fit rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium tracking-wide">HiuHiu Directory</span>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight text-balance sm:text-5xl">{banner.title || fallbackBanner.title}</h1>
          {banner.subtitle && <p className="mt-3 max-w-md text-sm text-primary-foreground/85 sm:text-base">{banner.subtitle}</p>}
        </div>
          {banner.link ? (
            <a href={banner.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 w-fit items-center gap-2 rounded-full bg-primary-foreground px-6 text-primary hover:bg-primary-foreground/90">
              <Search className="size-4" />
              ไปยังร้านค้า
            </a>
          ) : (
            <Button render={<Link href="/shops" />} nativeButton={false} className="h-11 w-fit gap-2 rounded-full bg-primary-foreground px-6 text-primary hover:bg-primary-foreground/90">
              <Search className="size-4" />
              ดูร้านค้าทั้งหมด
            </Button>
          )}
      </div>
      {banners.length > 1 && (
        <>
            <button type="button" onClick={() => move(-1)} aria-label="แบนเนอร์ก่อนหน้า" className="absolute inset-y-0 left-3 my-auto grid size-9 place-items-center rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur hover:bg-primary-foreground/30"><ChevronLeft className="size-5" /></button>
            <button type="button" onClick={() => move(1)} aria-label="แบนเนอร์ถัดไป" className="absolute inset-y-0 right-3 my-auto grid size-9 place-items-center rounded-full bg-primary-foreground/20 text-primary-foreground backdrop-blur hover:bg-primary-foreground/30"><ChevronRight className="size-5" /></button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {banners.map((item, index) => <button key={item.id} type="button" aria-label={`แสดงแบนเนอร์ที่ ${index + 1}`} onClick={() => setActiveIndex(index)} className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-primary-foreground' : 'w-1.5 bg-primary-foreground/40'}`} />)}
          </div>
        </>
      )}
    </section>
  )
}
