import Link from 'next/link'
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <Image
            src="/logo.jpg"
            alt="โลโก้ HiuHiu"
            width={32}
            height={32}
            className="size-8 rounded-lg object-cover"
          />
          <span className="font-display text-lg font-bold text-foreground">HiuHiu</span>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          แพลตฟอร์มรวมร้านรับหิ้วที่ไว้ใจได้ · ตรวจสอบก่อนสั่งซื้อทุกครั้ง
        </p>
        <nav className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link href="/shops" className="transition hover:text-foreground">
            ค้นหาร้าน
          </Link>
          <Link href="/login" className="transition hover:text-foreground">
            เข้าสู่ระบบ
          </Link>
          <Link href="/register" className="transition hover:text-foreground">
            สมัครสมาชิก
          </Link>
        </nav>
      </div>
    </footer>
  )
}
