'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AdminClient } from '@/components/admin/admin-client'
import { RiskRecordClient } from '@/components/admin/risk-record-client'
import { Button } from '@/components/ui/button'
import { Store, AlertTriangle } from 'lucide-react'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'whitelist' | 'blacklist'>('whitelist')

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          หน้าจัดการสำหรับแอดมิน — จัดการร้านค้าปลอดภัยและประวัติคนโกง
        </p>
        
        <div className="mb-6 flex flex-wrap gap-3 items-center border-b border-border pb-4">
          <Button 
            onClick={() => setActiveTab('whitelist')}
            variant={activeTab === 'whitelist' ? 'default' : 'ghost'} 
            className="rounded-xl gap-2 font-semibold"
          >
            <Store className="size-4" />
            ร้านค้าปลอดภัย (Whitelist)
          </Button>
          <Button 
            onClick={() => setActiveTab('blacklist')}
            variant={activeTab === 'blacklist' ? 'destructive' : 'ghost'} 
            className="rounded-xl gap-2 font-semibold"
          >
            <AlertTriangle className="size-4" />
            ประวัติเตือนภัย (Blacklist)
          </Button>
          <div className="ml-auto">
            <Button render={<Link href="/admin/banner" />} nativeButton={false} variant="outline" className="rounded-xl">
              จัดการแบนเนอร์
            </Button>
          </div>
        </div>
        
        <div className="transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'whitelist' ? <AdminClient /> : <RiskRecordClient />}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
