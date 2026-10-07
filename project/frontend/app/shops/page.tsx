import { SearchClient } from '@/components/search/search-client'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default async function ShopsPage({
  searchParams,
}: {
  // เปลี่ยนตรงนี้ให้รองรับ Promise ตามที่ Next.js ต้องการ
  searchParams: Promise<{ q?: string; category?: string }> 
}) {
  // แกะกล่อง Promise ด้วยคำว่า await
  const resolvedParams = await searchParams 
  const searchQuery = resolvedParams.q || resolvedParams.category || ''

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <SearchClient query={searchQuery} />
      </div>
      </main>
      <SiteFooter />
    </div>
  )
}