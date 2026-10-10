import {
  Shirt,
  Sparkles,
  Gamepad2,
  Cookie,
  Music,
  Coffee,
  ShoppingBag,
  Package,
  Store,
  type LucideIcon,
} from 'lucide-react'

export type Platform = 'Facebook' | 'Instagram' | 'X (Twitter)'

export type ShopStatus = 'safe' | 'watch' | 'caution'

export type Category = {
  slug: string
  label: string
  icon: LucideIcon
}

export type Shop = {
  id: string
  name: string
  platform: Platform
  status: ShopStatus
  description: string
  image: string
  link: string
}

export const shops: Shop[] = []

// หมวดหมู่
export const categories: Category[] = [
  { slug: 'ทั้งหมด', label: 'ร้านค้าทั้งหมด', icon: Store },
  { slug: 'แฟชั่น', label: 'แฟชั่น/เสื้อผ้า/เครื่องแต่งกาย', icon: Shirt }, 
  { slug: 'สกินแคร์', label: 'เครื่องสำอาง/สกินแคร์', icon: Sparkles },
  { slug: 'กระเป๋า', label: 'กระเป๋า', icon: ShoppingBag }, 
  { slug: 'art toy', label: 'ของเล่น/Art Toy', icon: Gamepad2 },
  { slug: 'ของใช้', label: 'ของใช้/แก้วน้ำ/จิปาถะ', icon: Coffee },
  { slug: 'ของกิน', label: 'อาหารเสริม/ของกิน', icon: Cookie },
  { slug: 'k-pop', label: 'สินค้า K-Pop/J-Pop', icon: Music },
  { slug: 'ร้านค้า', label: 'พรีออเดอร์/อื่นๆ', icon: Package },
]

export const statusConfig: Record<
  ShopStatus,
  { label: string; className: string; dotClassName: string }
> = {
  safe: {
    label: 'ปลอดภัย',
    className: 'bg-safe text-safe-foreground',
    dotClassName: 'bg-safe-foreground',
  },
  watch: {
    label: 'กำลังตรวจสอบ',
    className: 'bg-warn text-warn-foreground',
    dotClassName: 'bg-warn-foreground',
  },
  caution: {
    label: 'มิจฉาชีพ',
    className: 'bg-danger text-danger-foreground',
    dotClassName: 'bg-danger-foreground',
  },
}

