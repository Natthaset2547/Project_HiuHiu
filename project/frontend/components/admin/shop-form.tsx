"use client"

import { Button } from "@/components/ui/button"

export function ShopForm() {
  return (
    <form className="space-y-4 bg-card p-6 rounded-lg border border-border shadow-sm mt-4">
      <h2 className="text-lg font-semibold">เพิ่มร้านค้าใหม่ (Whitelist)</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">ชื่อร้านค้า</label>
        <input 
          type="text" 
          className="w-full border rounded-md p-2 text-sm" 
          placeholder="เช่น ร้านค้า Art Toy by K.A" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">URL ของร้านค้า</label>
        <input 
          type="url" 
          className="w-full border rounded-md p-2 text-sm" 
          placeholder="https://facebook.com/..." 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">แพลตฟอร์ม</label>
        <select className="w-full border rounded-md p-2 text-sm">
          <option>Facebook</option>
          <option>Instagram</option>
          <option>X (Twitter)</option>
        </select>
      </div>

      <div className="pt-4 flex justify-end space-x-2">
        <Button variant="outline" type="button">ยกเลิก</Button>
        <Button type="submit">บันทึกข้อมูล</Button>
      </div>
    </form>
  )
}