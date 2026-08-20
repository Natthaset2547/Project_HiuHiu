import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans_Thai, Prompt } from 'next/font/google'
import './globals.css'

const ibmPlexThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-thai',
})

const prompt = Prompt({
  subsets: ['thai', 'latin'],
  weight: ['500', '600', '700'],
  variable: '--font-prompt',
})

export const metadata: Metadata = {
  title: 'HiuHiu — รวมร้านรับหิ้วที่ไว้ใจได้',
  description:
    'HiuHiu แพลตฟอร์มรวมร้านรับหิ้วที่ไว้ใจได้ ค้นหาร้าน ตรวจสอบประวัติร้านค้า และตรวจสอบลิงก์ก่อนสั่งซื้อ',
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
    <html lang="th" className={`${ibmPlexThai.variable} ${prompt.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
