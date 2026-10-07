'use client'

import { useEffect, useState, useRef, type CSSProperties } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle, Check, X, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BACKEND_URL } from '@/lib/api'

type IdentifierType = 'shop_name' | 'shop_link' | 'bank_account' | 'account_owner'
type RecordStatus = 'safe' | 'pending' | 'scam'

const typeLabels: Record<IdentifierType, string> = {
  shop_name: 'ชื่อร้านค้า',
  shop_link: 'ลิงก์ร้านค้า',
  bank_account: 'เลขบัญชี',
  account_owner: 'ชื่อเจ้าของบัญชี',
}

const statusOptionStyle: Record<RecordStatus, CSSProperties> = {
  safe: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  pending: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  scam: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
}

type Row = {
  id: string
  identifier_type: IdentifierType
  identifier: string
  status: RecordStatus
  source_name: string
  notes: string
}

export function RiskRecordClient() {
  const [rows, setRows] = useState<Row[]>([])
  const [authorized, setAuthorized] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Draft for Edit
  const [draftType, setDraftType] = useState<IdentifierType>('bank_account')
  const [draftIdentifier, setDraftIdentifier] = useState('')
  const [draftStatus, setDraftStatus] = useState<RecordStatus>('scam')
  const [draftNotes, setDraftNotes] = useState('')
  const [draftSourceName, setDraftSourceName] = useState('')

  // State for Add
  const [adding, setAdding] = useState(false)
  const [newBankAccount, setNewBankAccount] = useState('')
  const [newAccountOwner, setNewAccountOwner] = useState('')
  const [newShopName, setNewShopName] = useState('')
  const [newShopLink, setNewShopLink] = useState('')
  const [newStatus, setNewStatus] = useState<RecordStatus>('scam')
  const [newNotes, setNewNotes] = useState('')
  const [newSourceName, setNewSourceName] = useState('ผู้ดูแลระบบ')
  const [newEvidenceImages, setNewEvidenceImages] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [error, setError] = useState('')

  async function apiRequest(path: string, options: RequestInit = {}) {
    const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
    const { csrfToken } = await csrfResponse.json()
    const headers: any = {
      'X-CSRFToken': csrfToken,
      ...(options.headers || {}),
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.detail || data.error || data.identifier?.[0] || 'ดำเนินการไม่สำเร็จ')
    return data
  }

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) throw new Error('กรุณาเข้าสู่ระบบก่อน')
        const data = await response.json()
        if (!data.user?.is_staff) throw new Error('บัญชีนี้ไม่มีสิทธิ์แอดมิน')
        setAuthorized(true)
        return fetch(`${BACKEND_URL}/api/risk-records/`, { credentials: 'include' })
      })
      .then((response) => response.json())
      .then((data) => {
        setRows(data.map((r: any) => ({
          ...r,
          id: String(r.id),
          notes: r.notes || '',
          source_name: r.source_name || '',
        })))
      })
      .catch((error) => console.error('ตรวจสอบสิทธิ์ไม่สำเร็จ:', error))
      .finally(() => setCheckingAccess(false))
  }, [])

  async function setStatus(id: string, status: RecordStatus) {
    setError('')
    try {
      await apiRequest(`/api/risk-records/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'บันทึกสถานะไม่สำเร็จ')
    }
  }

  async function remove(id: string) {
    setError('')
    try {
      await apiRequest(`/api/risk-records/${id}/`, { method: 'DELETE' })
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'ลบข้อมูลไม่สำเร็จ')
    }
  }

  function startEdit(row: Row) {
    setEditingId(row.id)
    setDraftType(row.identifier_type)
    setDraftIdentifier(row.identifier)
    setDraftStatus(row.status)
    setDraftNotes(row.notes)
    setDraftSourceName(row.source_name)
  }

  async function saveEdit(id: string) {
    setError('')
    try {
      const updated = await apiRequest(`/api/risk-records/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          identifier_type: draftType,
          identifier: draftIdentifier.trim(),
          status: draftStatus,
          notes: draftNotes.trim(),
          source_name: draftSourceName.trim(),
        }),
      })
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, ...updated, id: String(updated.id) } : r
        ),
      )
      setEditingId(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'แก้ไขไม่สำเร็จ')
    }
  }

  async function addRecord(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    const fieldsToCreate: { type: IdentifierType; val: string }[] = []
    if (newBankAccount.trim()) fieldsToCreate.push({ type: 'bank_account', val: newBankAccount.trim() })
    if (newAccountOwner.trim()) fieldsToCreate.push({ type: 'account_owner', val: newAccountOwner.trim() })
    if (newShopName.trim()) fieldsToCreate.push({ type: 'shop_name', val: newShopName.trim() })
    if (newShopLink.trim()) fieldsToCreate.push({ type: 'shop_link', val: newShopLink.trim() })

    if (fieldsToCreate.length === 0) {
      setError('กรุณากรอกข้อมูลอย่างน้อย 1 ช่อง (เช่น เลขบัญชี หรือ ชื่อ)')
      return
    }

    try {
      const newRecords = []
      for (const field of fieldsToCreate) {
        const formData = new FormData()
        formData.append('identifier_type', field.type)
        formData.append('identifier', field.val)
        formData.append('status', newStatus)
        formData.append('notes', newNotes.trim())
        formData.append('source_name', newSourceName.trim() || 'ผู้ดูแลระบบ')
        newEvidenceImages.forEach(img => formData.append('evidence_images', img))

        const record = await apiRequest('/api/risk-records/', {
          method: 'POST',
          body: formData,
        })
        newRecords.push({ ...record, id: String(record.id) })
      }
      
      setRows((prev) => [...newRecords, ...prev])
      
      setNewBankAccount('')
      setNewAccountOwner('')
      setNewShopName('')
      setNewShopLink('')
      setNewNotes('')
      setNewEvidenceImages([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setAdding(false)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'เพิ่มข้อมูลบางส่วนไม่สำเร็จ (อาจมีข้อมูลซ้ำแล้ว)')
      // รีเฟรชข้อมูลเผื่อมีบางอันบันทึกสำเร็จไปแล้ว
      fetch(`${BACKEND_URL}/api/risk-records/`, { credentials: 'include' })
        .then((response) => response.json())
        .then((data) => {
          setRows(data.map((r: any) => ({ ...r, id: String(r.id), notes: r.notes || '', source_name: r.source_name || '' })))
        }).catch(() => {})
    }
  }

  if (checkingAccess) return <p className="rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">กำลังตรวจสอบสิทธิ์...</p>
  if (!authorized) return <p className="rounded-3xl border border-danger/30 bg-card p-12 text-center text-sm text-danger-foreground">บัญชีนี้ไม่มีสิทธิ์เข้าจัดการประวัติคนโกง</p>

  return (
    <div className="rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-red-100 text-red-600">
            <AlertTriangle className="size-5" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              ประวัติเตือนภัย (Blacklist)
            </h1>
            <p className="text-sm text-muted-foreground">จัดการรายชื่อคนโกงหรือผู้ต้องสงสัย</p>
          </div>
        </div>
        <Button onClick={() => setAdding((v) => !v)} className="h-10 gap-2 rounded-xl px-4 bg-danger text-danger-foreground hover:bg-danger/90">
          <Plus className="size-4" />
          เพิ่มประวัติเตือนภัย
        </Button>
      </div>

      {adding && (
        <form onSubmit={addRecord} className="grid gap-3 border-b border-border bg-danger/5 p-6 md:grid-cols-2">
          <div className="md:col-span-2 mb-2">
            <p className="text-sm font-semibold text-red-600">กรอกข้อมูลที่มี (ไม่จำเป็นต้องกรอกครบทุกช่อง)</p>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">เลขบัญชี</label>
            <input
              value={newBankAccount}
              onChange={(e) => setNewBankAccount(e.target.value)}
              placeholder="เลขบัญชี 10-12 หลัก"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ชื่อเจ้าของบัญชี</label>
            <input
              value={newAccountOwner}
              onChange={(e) => setNewAccountOwner(e.target.value)}
              placeholder="ชื่อ นามสกุล"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ชื่อร้านค้า (ถ้ามี)</label>
            <input
              value={newShopName}
              onChange={(e) => setNewShopName(e.target.value)}
              placeholder="ชื่อเพจ หรือ ร้านค้า"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">ลิงก์ร้านค้า (ถ้ามี)</label>
            <input
              value={newShopLink}
              onChange={(e) => setNewShopLink(e.target.value)}
              placeholder="เช่น https://facebook.com/..."
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
          </div>
          
          <div className="md:col-span-2 border-t border-border/50 my-2"></div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">สถานะ</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as RecordStatus)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm font-medium outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
              style={statusOptionStyle[newStatus]}
            >
              <option value="scam" style={statusOptionStyle.scam}>ควรระวัง (มิจฉาชีพ)</option>
              <option value="pending" style={statusOptionStyle.pending}>กำลังตรวจสอบ</option>
              <option value="safe" style={statusOptionStyle.safe}>ปลอดภัย</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">แหล่งที่มา</label>
            <input
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              placeholder="เช่น ผู้ดูแลระบบ, แฟนเพจ..."
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">หมายเหตุ (ถ้ามี)</label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              placeholder="รายละเอียดเพิ่มเติมพฤติกรรมการโกง..."
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger/25"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">รูปภาพหลักฐาน (ถ้ามี)</label>
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
                    setNewEvidenceImages((prev) => [...prev, ...files])
                  }
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
              />
              <Button 
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border-dashed border-2 bg-slate-50/50 hover:bg-slate-100 text-muted-foreground"
              >
                <ImagePlus className="size-5" />
                เพิ่มรูปภาพหลักฐาน (เลือกทีละรูป หรือหลายรูปก็ได้)
              </Button>
              {newEvidenceImages.length > 0 && (
                <div className="mt-1 flex flex-col gap-2">
                  {newEvidenceImages.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-md bg-muted/50 p-2 px-3 text-sm">
                      <span className="truncate max-w-[200px] text-muted-foreground sm:max-w-[300px]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = newEvidenceImages.filter((_, i) => i !== idx)
                          setNewEvidenceImages(newImages)
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
          <div className="flex gap-2 md:col-span-2 md:justify-end">
            <Button type="submit" className="h-10 rounded-lg px-5 bg-danger text-danger-foreground hover:bg-danger/90">
              บันทึก Blacklist
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)} className="h-10 rounded-lg px-4">
              ยกเลิก
            </Button>
          </div>
        </form>
      )}

      {error && <p className="border-b border-danger/20 bg-danger/10 px-6 py-3 text-sm text-danger-foreground">{error}</p>}

      <div className="hidden grid-cols-[1.5fr_2fr_1fr_1fr] gap-4 px-6 py-3 text-xs font-medium text-muted-foreground md:grid">
        <span>ประเภท</span>
        <span>ข้อมูล</span>
        <span>สถานะ</span>
        <span className="text-right">การจัดการ</span>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li key={row.id} className={`grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-[1.5fr_2fr_1fr_1fr] md:items-center md:gap-4 ${editingId === row.id ? 'bg-muted/20' : ''}`}>
            {editingId === row.id ? (
              <>
                <select value={draftType} onChange={(e) => setDraftType(e.target.value as IdentifierType)} className="h-9 w-full rounded-lg border border-primary bg-background px-3 text-xs outline-none">
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <div className="space-y-2">
                  <input value={draftIdentifier} onChange={(e) => setDraftIdentifier(e.target.value)} autoFocus className="h-9 w-full rounded-lg border border-primary bg-background px-3 text-xs outline-none" />
                  <input value={draftSourceName} onChange={(e) => setDraftSourceName(e.target.value)} placeholder="แหล่งที่มา" className="h-9 w-full rounded-lg border border-border bg-background px-3 text-xs outline-none" />
                  <textarea value={draftNotes} onChange={(e) => setDraftNotes(e.target.value)} rows={2} placeholder="หมายเหตุ" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none" />
                </div>
                <select value={draftStatus} onChange={(e) => setDraftStatus(e.target.value as RecordStatus)} className="h-8 w-fit min-w-28 rounded-full border px-3 text-xs font-medium outline-none" style={statusOptionStyle[draftStatus]}>
                  <option value="scam" style={statusOptionStyle.scam}>ควรระวัง</option>
                  <option value="pending" style={statusOptionStyle.pending}>กำลังตรวจสอบ</option>
                  <option value="safe" style={statusOptionStyle.safe}>ปลอดภัย</option>
                </select>
                <div className="flex items-start gap-1 md:justify-end">
                  <button type="button" onClick={() => saveEdit(row.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-safe-foreground hover:bg-safe"><Check className="size-4" />บันทึก</button>
                  <button type="button" onClick={() => setEditingId(null)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"><X className="size-4" />ยกเลิก</button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="inline-block rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                    {typeLabels[row.identifier_type]}
                  </span>
                  <div className="mt-2 text-xs text-muted-foreground">จาก: {row.source_name}</div>
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-foreground break-all">{row.identifier}</span>
                  {row.notes && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{row.notes}</p>}
                  {row.evidence_image && (
                    <a href={row.evidence_image} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      ดูหลักฐานแนบ (เก่า)
                    </a>
                  )}
                  {row.evidences && row.evidences.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {row.evidences.map((ev: any, idx: number) => (
                        <a key={ev.id} href={ev.image} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          ดูหลักฐาน {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <select value={row.status} onChange={(e) => setStatus(row.id, e.target.value as RecordStatus)} className="h-8 w-fit min-w-28 rounded-full border px-3 text-xs font-medium outline-none" style={statusOptionStyle[row.status]}>
                    <option value="scam" style={statusOptionStyle.scam}>ควรระวัง</option>
                    <option value="pending" style={statusOptionStyle.pending}>กำลังตรวจสอบ</option>
                    <option value="safe" style={statusOptionStyle.safe}>ปลอดภัย</option>
                  </select>
                </div>
                <div className="flex items-start gap-1 md:justify-end">
                  <button type="button" onClick={() => startEdit(row)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"><Pencil className="size-4" />แก้ไข</button>
                  <button type="button" onClick={() => remove(row.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-danger-foreground hover:bg-danger"><Trash2 className="size-4" />ลบ</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
      {rows.length === 0 && <p className="px-6 py-16 text-center text-sm text-muted-foreground">ยังไม่มีประวัติเตือนภัยในระบบ กด “เพิ่มประวัติเตือนภัย” เพื่อเริ่มต้น</p>}
    </div>
  )
}
