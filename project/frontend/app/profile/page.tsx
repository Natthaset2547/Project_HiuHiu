'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LogOut, Heart, Loader2, MessageSquare, Settings, Star } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ShopCard } from '@/components/shop-card'
import { BACKEND_URL } from '@/lib/api'
import { Button } from '@/components/ui/button'

type CurrentUser = {
  username: string
  email: string
  is_staff: boolean
  avatar?: string
}

type Review = {
  id: number
  shop: number
  shop_name?: string
  rating: number
  comment: string
  image?: string | null
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [favoriteShops, setFavoriteShops] = useState<any[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [loadingFavorites, setLoadingFavorites] = useState(true)
  const [loadingReviews, setLoadingReviews] = useState(true)
  
  const [activeTab, setActiveTab] = useState<'favorites' | 'reviews' | 'settings'>('favorites')
  const [editUsername, setEditUsername] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editAvatar, setEditAvatar] = useState<File | null>(null)
  const [oldPassword, setOldPassword] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  useEffect(() => {
    fetch(`${BACKEND_URL}/api/auth/me/`, { credentials: 'include' })
      .then(async (response) => {
        if (!response.ok) {
          router.replace('/login')
          return
        }
        const data = await response.json()
        setUser(data.user)
        setEditUsername(data.user.username)
        setEditEmail(data.user.email)
        fetchFavorites()
        fetchMyReviews()
      })
      .finally(() => setLoading(false))

    async function fetchFavorites() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/shops/my_favorites/`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setFavoriteShops(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingFavorites(false)
      }
    }
    
    async function fetchMyReviews() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/reviews/my_reviews/`, { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setMyReviews(data.results || data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingReviews(false)
      }
    }
  }, [router])

  async function handleLogout() {
    const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, {
      credentials: 'include',
    })
    const { csrfToken } = await csrfResponse.json()
    await fetch(`${BACKEND_URL}/api/auth/logout/`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': csrfToken },
    })
    router.push('/')
    router.refresh()
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const csrfResponse = await fetch(`${BACKEND_URL}/api/auth/csrf/`, { credentials: 'include' })
      const { csrfToken } = await csrfResponse.json()
      
      const formData = new FormData()
      formData.append('username', editUsername)
      formData.append('email', editEmail)
      if (editPassword) {
        formData.append('password', editPassword)
        formData.append('old_password', oldPassword)
      }
      if (editAvatar) {
        formData.append('avatar', editAvatar)
      }
      
      const res = await fetch(`${BACKEND_URL}/api/auth/update-profile/`, {
        method: 'PATCH',
        headers: {
          'X-CSRFToken': csrfToken
        },
        credentials: 'include',
        body: formData
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'บันทึกไม่สำเร็จ')
      
      setUser(data.user)
      setEditPassword('')
      setOldPassword('')
      setEditAvatar(null)
      setProfileSuccess('บันทึกการเปลี่ยนแปลงสำเร็จ!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err: any) {
      setProfileError(err.message)
    } finally {
      setProfileSaving(false)
    }
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`size-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'}`} />
    ))
  }

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-col flex-1 px-4 py-10">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground mt-10">กำลังโหลด...</p>
        ) : user ? (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Profile */}
            <aside className="w-full md:w-64 shrink-0">
              <section className="w-full rounded-3xl border border-border bg-card p-6 shadow-sm text-center">
                {user.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="mx-auto size-20 rounded-full object-cover border-2 border-border shadow-sm" />
                ) : (
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="mt-4">
                  <h1 className="font-display text-xl font-bold text-foreground truncate">{user.username}</h1>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.is_staff && <p className="mt-2 text-xs font-medium text-primary">ผู้ดูแลระบบ</p>}
                </div>
                
                <div className="mt-6 flex flex-col gap-2">
                  {user.is_staff && (
                    <Link href="/admin" className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition">
                      จัดการหลังบ้าน
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition">
                    <LogOut className="size-4" />
                    ออกจากระบบ
                  </button>
                </div>
              </section>
              
              {/* Tab Navigation (Desktop) */}
              <nav className="mt-6 flex flex-col gap-1">
                <button onClick={() => setActiveTab('favorites')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === 'favorites' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Heart className={`size-4 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
                  ร้านโปรดที่บันทึกไว้
                </button>
                <button onClick={() => setActiveTab('reviews')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === 'reviews' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <MessageSquare className={`size-4 ${activeTab === 'reviews' ? 'fill-current' : ''}`} />
                  ประวัติการรีวิวของฉัน
                </button>
                <button onClick={() => setActiveTab('settings')} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Settings className="size-4" />
                  การตั้งค่าบัญชี
                </button>
              </nav>
            </aside>

            {/* Main Content Area */}
            <section className="flex-1 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8 min-h-[500px]">
              
              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                    <Heart className="size-5 text-red-500 fill-red-500" />
                    <h2 className="font-display text-xl font-bold">ร้านโปรดที่บันทึกไว้</h2>
                  </div>
                  
                  {loadingFavorites ? (
                    <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
                  ) : favoriteShops.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {favoriteShops.map((shop) => (
                        <ShopCard key={shop.id} shop={shop} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                      <p>คุณยังไม่ได้บันทึกร้านโปรดร้านไหนเลย</p>
                      <Link href="/shops" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        ไปหาร้านถูกใจกันเลย
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                    <MessageSquare className="size-5 text-primary fill-primary" />
                    <h2 className="font-display text-xl font-bold">ประวัติการรีวิวของฉัน</h2>
                  </div>
                  
                  {loadingReviews ? (
                    <div className="flex justify-center py-10"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
                  ) : myReviews.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {myReviews.map((review) => (
                        <div key={review.id} className="rounded-2xl border border-border bg-secondary/20 p-5">
                          <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">รีวิวร้าน: {review.shop_name || `ร้านค้า ID ${review.shop}`}</span>
                            </div>
                            <Link href={`/shop/${review.shop}`} className="text-xs font-medium text-primary hover:underline">
                              ดูร้านค้านี้ &rarr;
                            </Link>
                          </div>
                          <div className="flex gap-1 mb-3">{renderStars(review.rating)}</div>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">{review.comment}</p>
                          {review.image && (
                            <img src={review.image} alt="หลักฐาน" className="mt-4 h-32 w-32 rounded-xl object-cover shadow-sm border border-border" />
                          )}
                          <p className="mt-4 text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                      <p>คุณยังไม่เคยเขียนรีวิวให้ร้านไหนเลย</p>
                      <Link href="/shops" className="mt-4 inline-block rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        ไปรีวิวร้านแรกของคุณเลย
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-300">
                  <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
                    <Settings className="size-5 text-zinc-500" />
                    <h2 className="font-display text-xl font-bold">การตั้งค่าบัญชี</h2>
                  </div>
                  
                  <form onSubmit={handleSaveProfile} className="max-w-md space-y-5">
                    {profileError && <p className="rounded-xl bg-danger/10 p-3 text-sm text-danger-foreground">{profileError}</p>}
                    {profileSuccess && <p className="rounded-xl bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">{profileSuccess}</p>}
                    
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-medium">รูปโปรไฟล์ (Avatar)</label>
                      <div className="flex items-center gap-4">
                        {editAvatar ? (
                          <img src={URL.createObjectURL(editAvatar)} alt="New Avatar" className="size-16 rounded-full object-cover border border-border" />
                        ) : user.avatar ? (
                          <img src={user.avatar} alt="Avatar" className="size-16 rounded-full object-cover border border-border" />
                        ) : (
                          <span className="grid size-16 place-items-center rounded-full bg-primary/20 text-xl font-bold text-primary">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <label className="cursor-pointer rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition">
                          อัปโหลดรูปใหม่
                          <input type="file" accept="image/*" className="hidden" onChange={e => setEditAvatar(e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium">ชื่อผู้ใช้งาน (Username)</label>
                      <input type="text" required value={editUsername} onChange={e => setEditUsername(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">อีเมล (Email)</label>
                      <input type="email" required value={editEmail} onChange={e => setEditEmail(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" />
                    </div>
                    <hr className="my-6 border-border" />
                    
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">รหัสผ่านเดิม <span className="text-muted-foreground font-normal">(เว้นว่างไว้ถ้าไม่ต้องการเปลี่ยน)</span></label>
                      <input type="password" required={!!editPassword} placeholder="รหัสผ่านปัจจุบันของคุณ" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" />
                    </div>
                    
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">รหัสผ่านใหม่ <span className="text-muted-foreground font-normal">(อย่างน้อย 8 ตัวอักษร)</span></label>
                      <input type="password" required={!!oldPassword} placeholder="••••••••" value={editPassword} onChange={e => setEditPassword(e.target.value)} minLength={8} className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm" />
                    </div>
                    <Button type="submit" disabled={profileSaving || (editUsername === user.username && editEmail === user.email && !editPassword && !editAvatar)} className="w-fit rounded-xl mt-4">
                      {profileSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </Button>
                  </form>
                </div>
              )}

            </section>
          </div>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  )
}
