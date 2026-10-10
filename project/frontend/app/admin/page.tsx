'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { AdminClient } from '@/components/admin/admin-client'
import { RiskRecordClient } from '@/components/admin/risk-record-client'
import { Button } from '@/components/ui/button'
import { Store, AlertTriangle } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'whitelist' | 'blacklist'>('whitelist')
  const [pendingReportsCount, setPendingReportsCount] = useState(0)

  useEffect(() => {
    function fetchPending() {
      fetch(`${BACKEND_URL}/api/risk-records/`, { credentials: 'include' })
        .then(async (response) => {
          if (!response.ok) return
          const data = await response.json()
          const pending = data.filter((item: any) => item.status === 'pending').length
          setPendingReportsCount(pending)
        })
        .catch(() => {})
    }
    fetchPending()
    
    window.addEventListener('riskRecordsChanged', fetchPending)
    return () => window.removeEventListener('riskRecordsChanged', fetchPending)
  }, [activeTab]) // Refresh when tab changes so admin sees up-to-date count

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
            className="rounded-xl gap-2 font-semibold relative"
          >
            <AlertTriangle className="size-4" />
            ประวัติเตือนภัย (Blacklist)
            {pendingReportsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white shadow-sm border-2 border-background">
                {pendingReportsCount}
              </span>
            )}
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
