'use client'

import { useState, useEffect, useMemo } from 'react'
import { Star, User, Trash2, ChevronLeft, ChevronRight, ImagePlus, X, Edit2 } from 'lucide-react'
import { BACKEND_URL } from '@/lib/api'

type ReviewImageItem = {
  id: number
  image: string
}

type Review = {
  id: number
  username: string
  rating: number
  comment: string
  image?: string | null
  images?: ReviewImageItem[]
  created_at: string
}

type ShopReviewsProps = {
  shopId: string | number
}

const ITEMS_PER_PAGE = 5

export function ShopReviews({ shopId }: ShopReviewsProps) {
  const [currentUser, setCurrentUser] = useState<{ username: string; is_staff: boolean } | null>(null)
  
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setCurrentUser(data.user)
        }
      })
      .catch(() => setCurrentUser(null))
  }, [])

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [newImages, setNewImages] = useState<File[]>([])
  
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
  const [existingImage, setExistingImage] = useState<string | null>(null)
  const [existingExtraImages, setExistingExtraImages] = useState<ReviewImageItem[]>([])
  
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [shopId])

  useEffect(() => {
    setCurrentPage(1)
  }, [filterRating])

  async function fetchReviews() {
    try {
      const res = await fetch(`${BACKEND_URL}/api/reviews/?shop=${shopId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const hasReviewed = reviews.some(r => r.username === currentUser?.username)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return
    if (rating < 1 || rating > 5) {
      setError('กรุณาเลือกดาว 1-5')
      return
    }
    
    setSubmitting(true)
    setError('')
    try {
      const csrfRes = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()

      const formData = new FormData()
      formData.append('shop', shopId.toString())
      formData.append('rating', rating.toString())
      formData.append('comment', comment)
      newImages.forEach((file) => {
        formData.append('images', file)
      })
      if (editingReviewId) {
        formData.append('keep_image_ids', existingExtraImages.map((img) => img.id).join(','))
        if (existingImage === null) {
          formData.append('clear_legacy_image', 'true')
        }
      }

      const url = editingReviewId 
        ? `${BACKEND_URL}/api/reviews/${editingReviewId}/`
        : `${BACKEND_URL}/api/reviews/`
        
      const method = editingReviewId ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
        body: formData
      })

      if (res.ok) {
        setComment('')
        setRating(5)
        setNewImages([])
        setEditingReviewId(null)
        setExistingImage(null)
        setExistingExtraImages([])
        fetchReviews()
      } else {
        setError('ไม่สามารถส่งความคิดเห็นได้ อาจจะซ้ำหรือเกิดข้อผิดพลาด')
      }
    } catch (e) {
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ')
    } finally {
      setSubmitting(false)
    }
  }

  function handleEditClick(r: Review) {
    setEditingReviewId(r.id)
    setRating(r.rating)
    setComment(r.comment)
    setExistingImage(r.image || null)
    setExistingExtraImages(r.images || [])
    setNewImages([])
  }

  function cancelEdit() {
    setEditingReviewId(null)
    setComment('')
    setRating(5)
    setNewImages([])
    setExistingImage(null)
    setExistingExtraImages([])
  }

  async function handleDelete(reviewId: number) {
    if (!confirm('ต้องการลบรีวิวนี้ใช่หรือไม่?')) return
    try {
      const csrfRes = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfRes.json()

      const res = await fetch(`${BACKEND_URL}/api/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include'
      })

      if (res.ok) fetchReviews()
      else alert('ลบไม่สำเร็จ')
    } catch (e) {
      alert('ลบไม่สำเร็จ')
    }
  }

  const stats = useMemo(() => {
    const total = reviews.length
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0)
    const avg = total > 0 ? (sum / total).toFixed(1) : '0.0'
    const counts = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length,
    }
    return { total, avg, counts }
  }, [reviews])

  const filteredReviews = useMemo(() => {
    if (filterRating === 'all') return reviews
    return reviews.filter(r => r.rating === filterRating)
  }, [reviews, filterRating])

  const totalPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return <div className="py-10 text-center text-sm text-muted-foreground">กำลังโหลดรีวิว...</div>

  // สร้าง Form Component แยกออกมาให้เรียกใช้ง่ายๆ ทั้ง Create และ Edit
  const renderReviewForm = () => (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <textarea
        className="min-h-[100px] w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        placeholder="คุณเคยเจอกลโกงรูปแบบนี้ไหม? แชร์ประสบการณ์ จุดสังเกต หรือแนบรูปแชทเพื่อเตือนภัยเพื่อนๆ..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted/50 hover:text-foreground">
            <ImagePlus className="size-4" /> เพิ่มรูปภาพหลักฐาน / ตัวอย่างแชท (เพิ่มได้หลายรูป)
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || [])
                if (files.length > 0) {
                  setNewImages((prev) => [...prev, ...files])
                }
                e.currentTarget.value = ''
              }}
            />
          </label>
          {(existingImage || existingExtraImages.length > 0 || newImages.length > 0) && (
            <span className="text-xs text-muted-foreground">
              แนบแล้ว {(existingImage ? 1 : 0) + existingExtraImages.length + newImages.length} รูป
            </span>
          )}
        </div>

        {(existingImage || existingExtraImages.length > 0 || newImages.length > 0) && (
          <div className="flex flex-wrap gap-3">
            {existingImage && (
              <div className="relative inline-block overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={existingImage.startsWith('http') ? existingImage : `${BACKEND_URL}${existingImage}`}
                  alt="Existing preview"
                  className="h-24 w-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setExistingImage(null)}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  title="ลบรูปนี้"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            {existingExtraImages.map((item) => (
              <div key={item.id} className="relative inline-block overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`}
                  alt="Existing preview"
                  className="h-24 w-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setExistingExtraImages((prev) => prev.filter((img) => img.id !== item.id))}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  title="ลบรูปนี้"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
            {newImages.map((file, idx) => (
              <div key={idx} className="relative inline-block overflow-hidden rounded-xl border border-border bg-muted">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New preview ${idx + 1}`}
                  className="h-24 w-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  title="ลบรูปนี้"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={submitting} className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50">
          {submitting ? (editingReviewId ? 'กำลังบันทึก...' : 'กำลังส่ง...') : (editingReviewId ? 'บันทึกการแก้ไข' : 'ส่งความคิดเห็นเตือนภัย')}
        </button>
        {editingReviewId && (
          <button type="button" onClick={cancelEdit} className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-transparent px-6 text-sm font-medium text-foreground hover:bg-muted">
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  )

  return (
    <div className="mt-8 w-full">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">
          💬 ความคิดเห็น & ประสบการณ์เตือนภัยจากผู้ใช้งาน ({stats.total})
        </h2>
      </div>

      {currentUser && !hasReviewed && !editingReviewId && (
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">ร่วมแชร์ประสบการณ์หรือเบาะแสเพิ่มเติม</h3>
          {renderReviewForm()}
        </div>
      )}

      {!currentUser && (
        <div className="mb-8 rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          กรุณาเข้าสู่ระบบเพื่อร่วมแชร์ประสบการณ์เตือนภัย
        </div>
      )}

      <div className="flex flex-col gap-6">
        {paginatedReviews.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">ยังไม่มีความคิดเห็นในเคสนี้ มาร่วมแชร์ข้อมูลเตือนภัยเป็นคนแรกได้เลย</div>
        ) : (
          paginatedReviews.map((r) => (
            <div key={r.id} className="border-b border-border pb-6 last:border-0">
              <div className="flex items-start gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary mt-1">
                  <User className="size-5 text-muted-foreground" />
                </div>
                
                {editingReviewId === r.id ? (
                  <div className="w-full flex-1">
                    <p className="font-medium text-foreground mb-3">{r.username} <span className="text-xs text-primary font-normal">(กำลังแก้ไข)</span></p>
                    {renderReviewForm()}
                  </div>
                ) : (
                  <div className="w-full flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{r.username}</p>
                        <span className="text-xs text-muted-foreground">
                          • {new Date(r.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">{r.comment}</p>
                      {(r.image || (r.images && r.images.length > 0)) && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          {r.image && (
                            <a
                              href={r.image.startsWith('http') ? r.image : `${BACKEND_URL}${r.image}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="overflow-hidden rounded-xl border border-border transition hover:opacity-90"
                            >
                              <img
                                src={r.image.startsWith('http') ? r.image : `${BACKEND_URL}${r.image}`}
                                alt="Review attached"
                                className="h-36 w-36 object-cover bg-muted sm:h-44 sm:w-44"
                              />
                            </a>
                          )}
                          {r.images?.map((item) => {
                            const fullUrl = item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`
                            return (
                              <a
                                key={item.id}
                                href={fullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="overflow-hidden rounded-xl border border-border transition hover:opacity-90"
                              >
                                <img
                                  src={fullUrl}
                                  alt="Review attached"
                                  className="h-36 w-36 object-cover bg-muted sm:h-44 sm:w-44"
                                />
                              </a>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {currentUser?.username === r.username && (
                        <button onClick={() => handleEditClick(r)} className="flex items-center gap-1 rounded p-2 text-xs text-blue-500 transition hover:bg-blue-500/10" title="แก้ไขรีวิว">
                          <Edit2 className="size-4" />
                        </button>
                      )}
                      {(currentUser?.username === r.username || currentUser?.is_staff) && (
                        <button onClick={() => handleDelete(r.id)} className="flex items-center gap-1 rounded p-2 text-xs text-red-500 transition hover:bg-red-500/10" title="ลบรีวิว">
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="grid size-8 place-items-center rounded border border-border bg-transparent text-muted-foreground transition hover:bg-muted disabled:opacity-30"><ChevronLeft className="size-4" /></button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`grid size-8 place-items-center rounded border text-sm font-medium transition ${currentPage === i + 1 ? 'border-primary bg-primary text-white' : 'border-border bg-transparent text-foreground hover:bg-muted'}`}>{i + 1}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="grid size-8 place-items-center rounded border border-border bg-transparent text-muted-foreground transition hover:bg-muted disabled:opacity-30"><ChevronRight className="size-4" /></button>
        </div>
      )}
    </div>
  )
}
