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
  source: 'whitelist' | 'registry' | 'google' | 'brave'
  bad_records_found: number
  findings?: { title: string; url: string; snippet: string }[]
  disclaimer?: string
  matched_shops?: string
  record_sources?: string
}

const sourceLabels: Record<RiskResult['source'], string> = {
  whitelist: 'Whitelist ของผู้ดูแลระบบ',
  registry: 'ทะเบียนข้อมูลที่ผู้ดูแลระบบตรวจสอบ',
  google: 'Google Search',
  brave: 'Brave Search',
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
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-10 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">ตรวจสอบประวัติร้านค้า</h2>
          </div>
          <p className="text-gray-500 mb-6 ml-11 text-sm md:text-base">
            กรอกชื่อร้าน ลิงก์ เลขบัญชี หรือชื่อเจ้าของบัญชีในช่องเดียวก่อนโอนเงิน
          </p>

          <div className="flex flex-col gap-3 ml-0 md:ml-11 md:flex-row">
            <input type="text" placeholder="ชื่อร้านค้า, ลิงก์ร้านค้า, เลขบัญชี หรือ ชื่อเจ้าของบัญชี" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-black focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:bg-blue-300 flex items-center justify-center min-w-[150px]"
            >
              {loading ? 'กำลังค้นหา...' : 'ตรวจสอบ'}
            </button>
          </div>

          {error && (
            <div role="alert" className="mt-6 ml-0 rounded-xl border-2 border-red-300 bg-red-50 p-6 text-red-900 md:ml-11">
              <h3 className="text-lg font-bold">ตรวจสอบข้อมูลภายนอกไม่สำเร็จ</h3>
              <p className="mt-2 text-sm">{error}</p>
            </div>
          )}

          {/* กล่องแสดงผลลัพธ์ (จะโผล่มาเมื่อกดค้นหา) */}
          {result && (
            <div className={`mt-6 ml-0 md:ml-11 p-6 rounded-xl border-2 transition-all ${
              result.status === 'safe' ? 'border-green-400 bg-green-50' : 
              result.status === 'scam' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'
            }`}>
              <h3 className="text-lg font-bold mb-3 text-gray-800">ผลการตรวจสอบ: {result.message}</h3>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-semibold text-gray-700">สถานะ:</span>
                <span className={`px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-sm ${
                  result.status === 'safe' ? 'bg-green-500' : 
                  result.status === 'scam' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                  {result.status === 'safe' ? 'ปลอดภัย' : result.status === 'scam' ? 'ควรระวัง' : 'รอตรวจสอบเพิ่มเติม'}
                </span>
              </div>
              <p className="text-gray-600 mt-3">
                {result.source === 'google' || result.source === 'brave'
                  ? `พบผลค้นหาที่เกี่ยวข้อง ${result.bad_records_found} รายการ จาก ${sourceLabels[result.source]}`
                  : `แหล่งข้อมูล: ${sourceLabels[result.source]}`}
              </p>
              {result.record_sources && <p className="mt-2 text-sm text-gray-600">ผู้ตรวจสอบหรือแหล่งอ้างอิง: {result.record_sources}</p>}
              {findings.length > 0 && (
                <ul className="mt-4 space-y-3 border-t border-gray-200 pt-4 text-sm text-gray-700">
                  {findings.map((finding) => (
                    <li key={finding.url}>
                      <a href={finding.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">
                        {finding.title}
                      </a>
                      {finding.snippet && <p className="mt-1 leading-relaxed text-gray-600">{finding.snippet}</p>}
                    </li>
                  ))}
                </ul>
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
