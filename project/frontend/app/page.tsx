'use client'
import { useState } from 'react'

import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Hero } from '@/components/home/hero'
import { Categories } from '@/components/home/categories'
import { BACKEND_URL } from '@/lib/api'

type RiskResult = {
  status: 'safe' | 'pending' | 'scam'
  message: string
  source: string
  bad_records_found: number
  findings?: { title: string; url: string; snippet: string }[]
  disclaimer?: string
  matched_shops?: string
  record_sources?: string
}

const sourceLabels: Record<string, string> = {
  whitelist: 'Whitelist ของผู้ดูแลระบบ',
  registry: 'ทะเบียนข้อมูลที่ผู้ดูแลระบบตรวจสอบ',
  google: 'Google Search',
  brave: 'Brave Search',
  serper: 'Google Search',
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<RiskResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const findings = result?.findings ?? []

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/check-risk/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'ไม่สามารถตรวจสอบข้อมูลได้ในขณะนี้')
      }
      setResult(data as RiskResult)
    } catch (requestError) {
      console.error('เกิดข้อผิดพลาด:', requestError)
      setError(requestError instanceof Error ? requestError.message : 'ไม่สามารถตรวจสอบข้อมูลได้ในขณะนี้')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-8 px-4 py-8">
        <Hero />

        {/* ----- เริ่มส่วนตรวจสอบประวัติร้านค้า ----- */}
        <div className="bg-card rounded-2xl shadow-sm p-8 mb-10 border border-border relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">ตรวจสอบประวัติร้านค้า</h2>
            </div>
          </div>
          <p className="text-muted-foreground mb-6 ml-0 md:ml-11 text-sm md:text-base mt-2 sm:mt-0">
            พิมพ์ชื่อร้าน, เลขบัญชี, เบอร์พร้อมเพย์, ลิงก์ หรือชื่อเจ้าของบัญชี เพื่อตรวจสอบประวัติก่อนโอนเงิน
          </p>

          <div className="flex flex-col gap-3 ml-0 md:ml-11 md:flex-row">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="ชื่อร้าน, ลิงก์ร้าน, เลขบัญชี, เบอร์พร้อมเพย์ หรือ ชื่อคนขาย" 
                value={query} 
                onChange={(e) => {
                  const val = e.target.value;
                  setQuery(val);
                  if (!val.trim()) {
                    setResult(null);
                    setError('');
                  }
                }} 
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()} 
                className="w-full rounded-xl border border-input bg-background px-4 py-3 pr-10 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary" 
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(''); setResult(null); setError(''); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                  aria-label="Clear search"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:bg-blue-300 flex items-center justify-center min-w-[150px]"
            >
              {loading ? 'กำลังค้นหา...' : 'ตรวจสอบ'}
            </button>
          </div>

          {error && (
            <div role="alert" className="mt-6 ml-0 rounded-xl border-2 border-yellow-300 bg-yellow-50 p-6 md:ml-11">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <h3 className="text-base font-bold text-yellow-900">ไม่สามารถค้นหาข้อมูลภายนอกได้ในขณะนี้</h3>
              </div>
              <p className="text-sm text-yellow-800">ระบบค้นหาภายนอกมีปัญหาชั่วคราว กรุณาลองใหม่อีกครั้งในอีกสักครู่</p>
              <p className="text-xs text-yellow-700 mt-1">({error})</p>
            </div>
          )}

          {/* กล่องแสดงผลลัพธ์ (จะโผล่มาเมื่อกดค้นหา) */}
          {result && (
            <div className={`mt-6 ml-0 md:ml-11 p-6 rounded-xl border-2 transition-all ${
              result.status === 'safe' ? 'border-green-400 bg-green-50' : 
                result.status === 'scam' ? 'border-red-400 bg-red-50' : 
                result.status === 'warning' ? 'border-orange-400 bg-orange-50' :
                result.status === 'neutral' ? 'border-gray-400 bg-gray-50' :
                'border-yellow-400 bg-yellow-50'
            }`}>
              <h3 className="text-lg font-bold mb-3 text-gray-800">ผลการตรวจสอบ: {result.message}</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-700">สถานะ:</span>
                <span className={`px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm ${
                  result.status === 'safe' ? 'bg-green-500' : 
                    result.status === 'scam' ? 'bg-red-500' : 
                    result.status === 'warning' ? 'bg-orange-500' :
                    result.status === 'neutral' ? 'bg-gray-500' :
                    'bg-yellow-500'
                }`}>
                  {result.status === 'safe' ? 'ตรวจสอบแล้ว ปลอดภัย' : 
                   result.status === 'scam' ? 'บัญชีอันตราย' : 
                   result.status === 'warning' ? 'พบข้อมูลน่าสงสัย' :
                   result.status === 'neutral' ? 'ไม่พบประวัติ' :
                   result.status === 'pending' ? 'รอการตรวจสอบ' :
                   'ไม่ทราบสถานะ'}
                </span>
              </div>
              <p className="text-gray-600 mt-3">
                แหล่งข้อมูล: {result.source.split(' + ').map((s: string) => sourceLabels[s] || s).join(' และ ')}
              </p>
              {result.record_sources && <p className="mt-2 text-sm text-gray-600">ผู้ตรวจสอบหรือแหล่งอ้างอิง: {result.record_sources}</p>}
              {/* แสดงผล Google Search ทุกครั้งที่มีข้อมูลการโกงจริงๆ (backend คัดกรองมาให้แล้ว) ไม่ว่าแอดมินจะตั้งสถานะอะไรก็ตาม */}
              {findings.length > 0 && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <p className="text-sm font-semibold text-gray-600 mb-3">🔍 ผลการค้นหาจาก Google เพื่อประกอบการตัดสินใจ:</p>
                  <ul className="space-y-3 text-sm text-gray-700">
                    {findings.map((finding) => (
                      <li key={finding.url}>
                        <a href={finding.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                          {finding.title}
                        </a>
                        {finding.snippet && (
                          <p 
                            className="mt-1 leading-relaxed text-gray-600" 
                            dangerouslySetInnerHTML={{ __html: finding.snippet }} 
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.disclaimer && <p className="mt-4 text-xs text-gray-500">{result.disclaimer}</p>}
            </div>
          )}
        </div>
        {/* ----- จบส่วนตรวจสอบประวัติร้านค้า ----- */}
        <Categories />
      </main>
      <SiteFooter />
    </div>
  )
}
