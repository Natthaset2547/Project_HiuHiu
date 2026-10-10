'use client'

import { useState, useRef } from 'react'
import { AlertTriangle, X, CheckCircle2, ImagePlus } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [bankAccount, setBankAccount] = useState('')
  const [accountOwner, setAccountOwner] = useState('')
  const [shopName, setShopName] = useState('')
  const [shopLink, setShopLink] = useState('')
  const [notes, setNotes] = useState('')
  const [evidenceImages, setEvidenceImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    if (!bankAccount.trim() && !accountOwner.trim() && !shopName.trim() && !shopLink.trim()) {
      setError('กรุณากรอกข้อมูลคนโกงอย่างน้อย 1 ช่อง')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      if (bankAccount.trim()) formData.append('bank_account', bankAccount.trim())
      if (accountOwner.trim()) formData.append('account_owner', accountOwner.trim())
      if (shopName.trim()) formData.append('shop_name', shopName.trim())
      if (shopLink.trim()) formData.append('shop_link', shopLink.trim())
      if (notes.trim()) formData.append('notes', notes.trim())
      evidenceImages.forEach((img) => formData.append('evidence_images', img))

      const response = await fetch(`${BACKEND_URL}/api/report-risk/`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'ส่งข้อมูลไม่สำเร็จ')
      
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setLoading(false)
    }
  }

  function resetAndClose() {
    setBankAccount('')
    setAccountOwner('')
    setShopName('')
    setShopLink('')
    setNotes('')
    setEvidenceImages([])
    if (fileInputRef.current) fileInputRef.current.value = ''
    setError('')
    setSuccess(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-16 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg mb-16 flex-none rounded-3xl bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-border bg-danger/5 p-5 md:p-6 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-danger/10 text-danger">
              <AlertTriangle className="size-5" />
            </span>
            <h2 className="text-xl font-bold text-foreground">แจ้งเบาะแสคนโกง</h2>
          </div>
          <button 
            onClick={resetAndClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 md:p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="size-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">ได้รับข้อมูลแล้ว!</h3>
              <p className="text-muted-foreground mb-8 px-4">
                ขอบคุณที่ช่วยแจ้งเบาะแส ข้อมูลของคุณเข้าสู่ระบบเพื่อรอผู้ดูแลระบบตรวจสอบและอนุมัติแล้วครับ
              </p>
              <Button onClick={resetAndClose} className="rounded-xl px-8 h-12 font-semibold">
                ปิดหน้าต่างนี้
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm font-semibold text-red-600 mb-4">
                กรุณากรอกข้อมูลที่มี (ไม่จำเป็นต้องกรอกครบทุกช่อง)
              </p>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">เลขบัญชี หรือ พร้อมเพย์</label>
                  <input
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="เช่น 2202898230"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ชื่อ-นามสกุล คนโกง</label>
                  <input
                    value={accountOwner}
                    onChange={(e) => setAccountOwner(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ชื่อร้านค้า / เพจ (ถ้ามี)</label>
                  <input
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="ชื่อเพจที่โกง"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ลิงก์ร้านค้า (ถ้ามี)</label>
                  <input
                    value={shopLink}
                    onChange={(e) => setShopLink(e.target.value)}
                    placeholder="เช่น https://facebook.com/..."
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">รายละเอียดเพิ่มเติม (พฤติกรรมการโกง)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="เช่น หลอกขายของแล้วบล็อค, ไม่ส่งของ..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">หลักฐานการแชทหรือโอนเงิน (ถ้ามี)</label>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      if (files.length > 0) {
                        setEvidenceImages((prev) => [...prev, ...files])
                      }
                      // Clear input so the exact same file can be selected again if needed
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 border-dashed border-2 bg-transparent hover:bg-white/10 text-white/70 hover:text-white transition-all"
                  >
                    <ImagePlus className="size-5" />
                    เพิ่มรูปภาพหลักฐาน (เลือกทีละรูป หรือหลายรูปก็ได้)
                  </Button>
                  {evidenceImages.length > 0 && (
                    <div className="mt-1 flex flex-col gap-2">
                      {evidenceImages.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 p-2 px-3 text-sm">
                          <span className="truncate max-w-[200px] text-muted-foreground sm:max-w-[300px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = evidenceImages.filter((_, i) => i !== idx)
                              setEvidenceImages(newImages)
                              if (newImages.length === 0 && fileInputRef.current) fileInputRef.current.value = ''
                            }}
                            className="text-muted-foreground transition-colors hover:text-danger"
                            title="ลบรูปภาพ"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger-foreground border border-danger/20">
                  {error}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={resetAndClose} className="rounded-xl font-medium">
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading} className="rounded-xl font-semibold bg-danger hover:bg-danger/90 text-danger-foreground px-6">
                  {loading ? 'กำลังส่งข้อมูล...' : 'ส่งเบาะแส'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
