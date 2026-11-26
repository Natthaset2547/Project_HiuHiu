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

// หมวดหมู่กลโกงรอบตัว
export const categories: Category[] = [
  { slug: 'ทั้งหมด', label: 'กลโกงทั้งหมด', icon: Store },
  { slug: 'แฟชั่น', label: 'หลอกขายเสื้อผ้า/แฟชั่น', icon: Shirt }, 
  { slug: 'สกินแคร์', label: 'สกินแคร์ปลอม/ครีมทิพย์', icon: Sparkles },
  { slug: 'กระเป๋า', label: 'หลอกขายแบรนด์เนม/กระเป๋า', icon: ShoppingBag }, 
  { slug: 'art toy', label: 'หลอกพรีออเดอร์/Art Toy', icon: Gamepad2 },
  { slug: 'ของใช้', label: 'หลอกเช่าหอพัก/ของใช้', icon: Coffee },
  { slug: 'ของกิน', label: 'หลอกสั่งอาหาร/คูปองทิพย์', icon: Cookie },
  { slug: 'k-pop', label: 'หลอกขายบัตรคอน/K-Pop', icon: Music },
  { slug: 'ร้านค้า', label: 'งานเสริมทิพย์/คอลเซ็นเตอร์', icon: Package },
]

export const statusConfig: Record<
  ShopStatus,
  { label: string; className: string; dotClassName: string }
> = {
  safe: {
    label: 'แจ้งเตือนทั่วไป',
    className: 'bg-safe text-safe-foreground',
    dotClassName: 'bg-safe-foreground',
  },
  watch: {
    label: 'เฝ้าระวังระบาด',
    className: 'bg-warn text-warn-foreground',
    dotClassName: 'bg-warn-foreground',
  },
  caution: {
    label: 'อันตรายสูง',
    className: 'bg-danger text-danger-foreground',
    dotClassName: 'bg-danger-foreground',
  },
}

