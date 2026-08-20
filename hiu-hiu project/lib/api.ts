// ไฟล์เขียนฟังก์ชันเชื่อมต่อกับ Backend (Django + MySQL) และ Google Custom Search API

const localBackendHost =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'localhost'
    : '127.0.0.1'

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  `http://${localBackendHost}:8000`

// ตัวอย่างฟังก์ชันดึงข้อมูลร้านค้า (Whitelist) ทั้งหมดจาก MySQL
export async function getWhitelistedShops() {
  try {
    // โค้ดนี้จะทำงานจริงตอนสร้าง Django เสร็จแล้ว
    // const response = await fetch(`${BACKEND_URL}/api/shops/`);
    // return await response.json();
    return [];
  } catch (error) {
    console.error("Error fetching shops:", error);
    return [];
  }
}

// ฟังก์ชันสำหรับเรียก Google Custom Search API
export async function searchFromGoogle(query: string) {
  // เดี๋ยวเราจะมาเขียนโค้ดเรียก Google API ตรงนี้ในภายหลัง
  console.log("Searching for:", query);
  return [];
}