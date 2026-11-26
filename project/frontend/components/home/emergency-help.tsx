'use client'

import { useState } from 'react'
import { PhoneCall, ShieldCheck, ExternalLink, Search, ListOrdered } from 'lucide-react'

const BANK_HOTLINES = [
  { name: 'ศูนย์ AOC สายด่วนตำรวจไซเบอร์ (ทุกธนาคาร)', code: 'AOC', phone: '1441', note: 'โทรฟรี 24 ชม. อายัดบัญชีม้าได้ทันที' },
  { name: 'ธนาคารกสิกรไทย (KBank)', code: 'KBANK', phone: '02-888-8888 กด 001', note: 'ศูนย์รับแจ้งเหตุภัยทางการเงิน 24 ชม.' },
  { name: 'ธนาคารไทยพาณิชย์ (SCB)', code: 'SCB', phone: '02-777-7575', note: 'สายด่วนภัยทางการเงิน 24 ชม.' },
  { name: 'ธนาคารกรุงไทย (Krungthai)', code: 'KTB', phone: '02-111-1111 กด 108', note: 'ระงับบัญชีมิจฉาชีพ 24 ชม.' },
  { name: 'ธนาคารกรุงเทพ (Bangkok Bank)', code: 'BBL', phone: '1333 กด *3', note: 'หรือ 02-645-5555 กด *3 ตลอด 24 ชม.' },
  { name: 'ธนาคารกรุงศรีอยุธยา (Krungsri)', code: 'BAY', phone: '1572 กด 5', note: 'ศูนย์รับแจ้งเหตุ 24 ชม.' },
  { name: 'ธนาคารทหารไทยธนชาต (ttb)', code: 'TTB', phone: '1428 กด 03', note: 'แจ้งเหตุภัยทางการเงิน 24 ชม.' },
  { name: 'ธนาคารออมสิน (GSB)', code: 'GSB', phone: '1115 กด 6', note: 'สายด่วนอายัดบัญชี 24 ชม.' },
  { name: 'ทรูมันนี่ วอลเล็ท (TrueMoney)', code: 'TRUEMONEY', phone: '1240 กด 6', note: 'แจ้งปัญหาถูกโกงผ่านวอลเล็ท 24 ชม.' },
]

const RECOVERY_STEPS = [
  {
    num: 1,
    step: 'แคปหลักฐานทั้งหมดทันที',
    desc: 'บันทึกภาพหน้าจอแชท, โปรไฟล์คนโกง, ลิงก์เพจ และสลิปโอนเงินที่เห็น QR Code กับเลขที่รายการชัดเจน',
  },
  {
    num: 2,
    step: 'โทรอายัดบัญชีฉุกเฉิน (ขอ Bank Case ID)',
    desc: 'โทรสายด่วน AOC 1441 หรือเบอร์ธนาคารของเรา เพื่อขอระงับบัญชีปลายทางชั่วคราว 72 ชม. และจดเลข Bank Case ID ไว้',
  },
  {
    num: 3,
    step: 'แจ้งความดำเนินคดีภายใน 72 ชั่วโมง',
    desc: 'แจ้งความออนไลน์ที่เว็บตำรวจไซเบอร์ thaipoliceonline.go.th หรือไปสถานีตำรวจใกล้บ้าน เพื่อให้ออกหมายอายัดถาวร',
  },
  {
    num: 4,
    step: 'แจ้งเบาะแสลงระบบ HiuHiu เพื่อเตือนภัยสังคม',
    desc: 'กดปุ่ม "🚨 แจ้งเบาะแสคนโกง" บนแถบเมนูด้านบนของเว็บเรา เพื่อขึ้นบัญชีเตือนภัยไม่ให้มิจฉาชีพไปหลอกคนอื่นต่อได้',
  },
]

export function EmergencyHelp() {
  const [bankFilter, setBankFilter] = useState('')

  const filteredBanks = BANK_HOTLINES.filter(
    (b) =>
      b.name.toLowerCase().includes(bankFilter.toLowerCase()) ||
      b.code.toLowerCase().includes(bankFilter.toLowerCase()) ||
      b.phone.includes(bankFilter)
  )

  return (
    <section className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-red-100 p-2.5 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <PhoneCall className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              ศูนย์ช่วยเหลือฉุกเฉิน & สายด่วนอายัดบัญชีมิจฉาชีพ 24 ชม.
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              หากเพิ่งโอนเงินให้มิจฉาชีพ ให้รีบทำตาม 4 ขั้นตอนด้านล่างและโทรอายัดบัญชีทันทีเพื่อโอกาสได้เงินคืนสูงสุด
            </p>
          </div>
        </div>

        <a
          href="https://www.thaipoliceonline.go.th"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          <ShieldCheck className="size-4" />
          แจ้งความออนไลน์ (ตำรวจไซเบอร์)
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-12">
        {/* 4 Steps Guide (Read-only) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ListOrdered className="size-4 text-red-600" />
            4 ขั้นตอนต้องทำทันทีเมื่อรู้ตัวว่าโดนโกง
          </h3>
          <div className="space-y-2.5">
            {RECOVERY_STEPS.map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-3.5"
              >
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {item.num}
                </span>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {item.step}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank Hotlines (Read-only badges) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-foreground">
              📞 เบอร์สายด่วนอายัดบัญชีฉุกเฉิน 24 ชั่วโมง
            </h3>
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={bankFilter}
                onChange={(e) => setBankFilter(e.target.value)}
                placeholder="ค้นหาชื่อธนาคาร..."
                className="h-8 w-full rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 max-h-[340px] overflow-y-auto pr-1">
            {filteredBanks.map((bank) => (
              <div
                key={bank.code}
                className={`flex flex-col justify-between rounded-xl border p-3.5 ${
                  bank.code === 'AOC'
                    ? 'border-red-500/40 bg-red-500/10 sm:col-span-2'
                    : 'border-border bg-secondary/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-foreground">{bank.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{bank.note}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-red-600/90 px-3 py-1.5 text-xs font-bold text-white select-all">
                    {bank.phone}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
