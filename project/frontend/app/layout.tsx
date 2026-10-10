import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HiuHiu — รวมร้านร้านค้าที่ไว้ใจได้',
  description:
    'HiuHiu แพลตฟอร์มรวมร้านร้านค้าที่ไว้ใจได้ ค้นหาร้าน ตรวจสอบประวัติร้านค้า และตรวจสอบลิงก์ก่อนสั่งซื้อ',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
