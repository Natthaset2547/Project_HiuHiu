'use client'

import { useState } from 'react'
import { ShieldAlert, ScanSearch, ClipboardCheck, AlertTriangle, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ScanFinding = {
  category: string
  detail: string
  weight: number
}

const SAMPLE_MESSAGES = [
  {
    label: 'ตัวอย่าง: SMS พัสดุตกค้าง/ลิงก์ปลอม',
    text: 'พัสดุของคุณจัดส่งไม่สำเร็จเนื่องจากที่อยู่ไม่ชัดเจน กรุณายืนยันตัวตนและเช็กสถานะด่วนที่ https://bit.ly/thm-post-verify ก่อนถูกตีกลับ',
  },
  {
    label: 'ตัวอย่าง: หลอกทำงานเสริมปั่นออเดอร์',
    text: 'รับสมัครงานพาร์ทไทม์ กดรับออเดอร์สินค้า รายได้วันละ 800-1,500 บาท ตอนนี้โบนัสพิเศษเข้าแล้ว แต่ต้องโอนเงินสำรองจ่ายค่าเปิดระบบ 500 บาทก่อนจึงจะถอนเงินทั้งหมดได้',
  },
  {
    label: 'ตัวอย่าง: คนขายเร่งโอนมัดจำ/บัญชีไม่ตรง',
    text: 'บัตรคอนเสิร์ตหลุดจองใบสุดท้ายครับ มีคนทักรอคิวต่อ 4 คน ถ้ารับต้องโอนมัดจำด่วนภายใน 10 นาทีนี้ครับ ไม่สะดวกนัดรับ โอนเข้าบัญชีแฟนผมได้เลยครับ',
  },
]

const RISK_RULES: { pattern: RegExp; category: string; detail: string; weight: number }[] = [
  {
    pattern: /(bit\.ly|tinyurl\.com|cutt\.ly|shorturl\.at|t\.co|rb\.gy|\.xyz|\.top|\.vip|\.cc|\.icu)/i,
    category: 'ลิงก์ย่อหรือโดเมนต้องสงสัย',
    detail: 'พบลิงก์ย่อหรือนามสกุลโดเมนที่มิจฉาชีพนิยมใช้ซ่อนเว็บปลอม/แอปดูดเงิน ห้ามกดลิงก์เด็ดขาด',
    weight: 45,
  },
  {
    pattern: /(พัสดุตกค้าง|จัดส่งไม่สำเร็จ|ยืนยันตัวตนด่วน|ได้รับสิทธิ์กู้เงิน|คืนค่าธรรมเนียม|อายัดบัญชี|กรมสรรพากร|การไฟฟ้าคืนเงิน|กยศ)/i,
    category: 'แอบอ้างหน่วยงาน/ขนส่ง (Phishing SMS)',
    detail: 'พบรูปแบบข้อความแอบอ้างบริษัทขนส่งหรือหน่วยงานรัฐเพื่อหลอกให้กดลิงก์หรือกรอกข้อมูลส่วนตัว',
    weight: 40,
  },
  {
    pattern: /(กดรับออเดอร์|งานพาร์ทไทม์|สำรองจ่าย|ค่าเปิดระบบ|ค่าธรรมเนียมถอนเงิน|โอนเพิ่มเพื่อถอน|ทำภารกิจ|ปั่นออเดอร์|คอมมิชชั่นสูง)/i,
    category: 'กลโกงหลอกทำงานออนไลน์ / ปั่นออเดอร์',
    detail: 'พบคำที่เกี่ยวกับการให้โอนเงินสำรองจ่ายหรือค่าเปิดระบบก่อนถอนเงิน ซึ่งเป็นมุกโกงงานออนไลน์ 100%',
    weight: 50,
  },
  {
    pattern: /(โอนมัดจำด่วน|คิวต่อเยอะ|หลุดจอง|ภายใน\s*\d+\s*นาที|โอนตอนนี้|ด่วนก่อนหลุด)/i,
    category: 'เร่งรัดให้โอนเงินผิดปกติ',
    detail: 'มิจฉาชีพมักสร้างความกดดันว่ามีคิวต่อเยอะหรือต้องโอนด่วน เพื่อให้เหยื่อไม่ทันตรวจสอบประวัติ',
    weight: 30,
  },
  {
    pattern: /(ไม่สะดวกนัดรับ|ไม่รับเก็บเงินปลายทาง|ไม่สะดวกวิดีโอคอล|โอนเข้าบัญชีแฟน|โอนเข้าบัญชีญาติ|บัญชีเพื่อน)/i,
    category: 'หลีกเลี่ยงการยืนยันตัวตน / เสี่ยงบัญชีม้า',
    detail: 'การปฏิเสธนัดรับ/วิดีโอคอล หรือให้โอนเข้าบัญชีชื่อคนอื่น มีความเสี่ยงสูงมากที่จะเป็นบัญชีม้า',
    weight: 35,
  },
  {
    pattern: /(openchat|โอเพ่นแชท|แอดไลน์ด่วน|line\s*id|ดาวน์โหลดแอป|ติดตั้งไฟล์|\.apk)/i,
    category: 'ชักชวนออกนอกแพลตฟอร์ม / ติดตั้งไฟล์อันตราย',
    detail: 'ระวังการดึงเข้ากลุ่ม OpenChat ที่มีหน้าม้า หรือการหลอกให้ติดตั้งไฟล์ .apk ดูดเงิน',
    weight: 35,
  },
]

const CHECKLIST_ITEMS = [
  {
    id: 'cheap',
    label: 'ราคาสินค้า / ค่าเช่าหอพัก ถูกกว่าราคาตลาดมากผิดปกติ (เช่น ลดราคาเกิน 40–50%)',
    weight: 20,
  },
  {
    id: 'urgent',
    label: 'ผู้ขายเร่งรัดให้รีบโอนเงินทันที อ้างว่า "มีคิวรอต่อเยอะ ถ้าไม่โอนตอนนี้หลุดจอง"',
    weight: 15,
  },
  {
    id: 'mismatch',
    label: 'ชื่อบัญชีธนาคารที่ให้โอน ไม่ตรงกับ ชื่อโปรไฟล์ผู้ขาย หรืออ้างว่าเป็นบัญชีแฟน/ญาติ',
    weight: 25,
  },
  {
    id: 'noproof',
    label: 'ไม่ยอมนัดรับ และไม่ยอมถ่ายรูป/วิดีโอคอลคู่กับสินค้าจริงพร้อมกระดาษเขียนชื่อปัจจุบัน',
    weight: 20,
  },
  {
    id: 'newprofile',
    label: 'โปรไฟล์หรือเพจเพิ่งสร้างใหม่, ปิดกั้นคอมเมนต์, หรือมีคนกดโกรธในโพสต์แต่ไม่มีคอมเมนต์',
    weight: 10,
  },
  {
    id: 'fee',
    label: 'มีการเรียกเก็บ "ค่ามัดจำล่วงหน้า / ค่าเปิดระบบ / ค่าปลดล็อกถอนเงิน"',
    weight: 25,
  },
]

export function ScamAnalyzer() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'checklist'>('scanner')
  const [inputText, setInputText] = useState('')
  const [scanResult, setScanResult] = useState<{
    score: number
    findings: ScanFinding[]
  } | null>(null)
  const [checkedIds, setCheckedIds] = useState<string[]>([])

  function handleAnalyzeText() {
    const trimmed = inputText.trim()
    if (!trimmed) return

    const findings: ScanFinding[] = []
    let totalWeight = 0

    for (const rule of RISK_RULES) {
      if (rule.pattern.test(trimmed)) {
        findings.push({
          category: rule.category,
          detail: rule.detail,
          weight: rule.weight,
        })
        totalWeight += rule.weight
      }
    }

    const score = Math.min(100, totalWeight)
    setScanResult({ score, findings })
  }

  function toggleChecklist(id: string) {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const checklistScore = Math.min(
    100,
    CHECKLIST_ITEMS.filter((item) => checkedIds.includes(item.id)).reduce(
      (sum, item) => sum + item.weight,
      0
    )
  )

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-purple-100 p-2.5 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              เครื่องมือวิเคราะห์กลโกง & ประเมินความเสี่ยงก่อนโอนเงิน
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              ไม่แน่ใจว่าข้อความแชท ลิงก์ SMS หรือคนขายกำลังหลอกเราอยู่หรือเปล่า? ลองสแกนหรือทำเช็กลิสต์ด้านล่างก่อนโอนเงิน
            </p>
          </div>
        </div>

        <div className="flex rounded-xl bg-muted p-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === 'scanner'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ScanSearch className="size-4" />
            สแกนข้อความ/ลิงก์
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-semibold transition ${
              activeTab === 'checklist'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ClipboardCheck className="size-4" />
            เช็กลิสต์ก่อนโอน
          </button>
        </div>
      </div>

      {activeTab === 'scanner' ? (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Sparkles className="size-3.5 text-purple-500" /> กดลองข้อความตัวอย่าง:
            </span>
            {SAMPLE_MESSAGES.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => {
                  setInputText(sample.text)
                  setScanResult(null)
                }}
                className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground transition hover:border-primary hover:bg-secondary"
              >
                {sample.label}
              </button>
            ))}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value)
              if (!e.target.value.trim()) setScanResult(null)
            }}
            rows={4}
            placeholder="วางข้อความแชทที่คนขายพิมพ์มา, ข้อความ SMS แจ้งเตือน หรือลิงก์ที่น่าสงสัยที่นี่ เพื่อวิเคราะห์รูปแบบกลโกง..."
            className="w-full rounded-xl border border-input bg-background p-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={handleAnalyzeText}
              disabled={!inputText.trim()}
              className="rounded-xl px-6 h-11 font-semibold bg-purple-600 hover:bg-purple-700 text-white"
            >
              <ScanSearch className="size-4 mr-2" />
              วิเคราะห์ความเสี่ยงข้อความนี้
            </Button>
            {inputText && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setInputText('')
                  setScanResult(null)
                }}
                className="rounded-xl h-11"
              >
                ล้างข้อความ
              </Button>
            )}
          </div>

          {scanResult && (
            <div
              className={`mt-5 rounded-xl border-2 p-5 transition-all ${
                scanResult.score >= 50
                  ? 'border-red-400 bg-red-50 dark:bg-red-950/25'
                  : scanResult.score > 0
                    ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/25'
                    : 'border-green-400 bg-green-50 dark:bg-green-950/25'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {scanResult.score >= 50 ? (
                    <AlertTriangle className="size-6 text-red-600 shrink-0" />
                  ) : scanResult.score > 0 ? (
                    <AlertTriangle className="size-6 text-orange-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="size-6 text-green-600 shrink-0" />
                  )}
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                    {scanResult.score >= 50
                      ? 'อันตรายสูง! ข้อความนี้ตรงกับแพตเทิร์นมิจฉาชีพ'
                      : scanResult.score > 0
                        ? 'พบจุดน่าสงสัยในข้อความ ควรระมัดระวังสูง'
                        : 'ไม่พบคำอันตรายชัดเจน แต่ยังควรเช็กเลขบัญชีก่อนโอน'}
                  </h3>
                </div>
                <span
                  className={`rounded-full px-4 py-1 text-sm font-bold text-white ${
                    scanResult.score >= 50
                      ? 'bg-red-600'
                      : scanResult.score > 0
                        ? 'bg-orange-500'
                        : 'bg-green-600'
                  }`}
                >
                  ความเสี่ยง {scanResult.score}%
                </span>
              </div>

              {scanResult.findings.length > 0 ? (
                <ul className="mt-4 space-y-2.5 border-t border-black/10 dark:border-white/10 pt-4">
                  {scanResult.findings.map((item, idx) => (
                    <li key={idx} className="text-sm text-gray-800 dark:text-gray-200">
                      <span className="font-bold text-red-700 dark:text-red-400">
                        • [{item.category}]:
                      </span>{' '}
                      {item.detail}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  ไม่พบลิงก์ย่อหรือประโยคหลอกลวงยอดฮิตในข้อความนี้ อย่างไรก็ตาม ควรนำชื่อบัญชีธนาคารไปค้นหาในช่องตรวจสอบประวัติคนโกงด้านบนก่อนโอนเงินเสมอ
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              ติ๊กข้อที่ตรงกับสถานการณ์ที่คุณกำลังเจอ เพื่อคำนวณความเสี่ยงก่อนโอนเงิน:
            </p>
            {checkedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setCheckedIds([])}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <RotateCcw className="size-3.5" /> รีเซ็ตเช็กลิสต์
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {CHECKLIST_ITEMS.map((item) => {
              const checked = checkedIds.includes(item.id)
              return (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition ${
                    checked
                      ? 'border-red-400 bg-red-50/70 dark:border-red-800 dark:bg-red-950/30'
                      : 'border-border bg-secondary/30 hover:bg-secondary/60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleChecklist(item.id)}
                    className="mt-0.5 size-4 accent-red-600 shrink-0"
                  />
                  <span className="leading-relaxed text-foreground">{item.label}</span>
                </label>
              )
            })}
          </div>

          <div className="rounded-xl border border-border bg-secondary/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="text-sm font-bold text-foreground">
                ระดับความเสี่ยงจากการประเมิน ({checkedIds.length}/{CHECKLIST_ITEMS.length} ข้อ):
              </span>
              <span
                className={`text-lg font-extrabold ${
                  checklistScore >= 50
                    ? 'text-red-600'
                    : checklistScore >= 25
                      ? 'text-orange-500'
                      : 'text-green-600'
                }`}
              >
                {checklistScore}% —{' '}
                {checklistScore >= 50
                  ? 'เสี่ยงโดนโกงสูงมาก ห้ามโอนเด็ดขาด!'
                  : checklistScore >= 25
                    ? 'มีความเสี่ยง ควรขอหลักฐานยืนยันตัวตนเพิ่ม'
                    : 'ความเสี่ยงต่ำ (แต่ควรเช็กชื่อบัญชีก่อนโอนเสมอ)'}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all duration-300 ${
                  checklistScore >= 50
                    ? 'bg-red-600'
                    : checklistScore >= 25
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.max(5, checklistScore)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
