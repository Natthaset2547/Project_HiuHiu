import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AdminClient } from '@/components/admin/admin-client'
import { Button } from '@/components/ui/button'

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          หน้าจัดการสำหรับแอดมิน — แก้ไข ลบ หรือเพิ่มร้านค้าในระบบ
        </p>
        <div className="mb-6">
          <Button render={<Link href="/admin/banner" />} nativeButton={false} variant="outline" className="rounded-xl">
            จัดการแบนเนอร์
          </Button>
        </div>
        <AdminClient />
      </main>
      <SiteFooter />
    </div>
  )
}
