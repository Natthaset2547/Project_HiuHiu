import io
import os
import requests
from PIL import Image

PHOTO_URLS = [
    # 1. Concert / K-Pop stage lights & crowd
    "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80",
    # 2. Collectible toys / figurines (Art Toy)
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80",
    # 3. Dorm / Condo bedroom interior
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    # 4. Part-time online work on laptop & phone
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    # 5. Fashion clothing rack / street fashion
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80",
    # 6. Skincare & cosmetic bottles
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
    # 7. Leather luxury handbag
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    # 8. Buffet / restaurant food table
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    # 9. Smartphone SMS message phishing
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    # 10. iPad / tablet and smartphone on desk
    "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    # 11. Sneakers & IG fashion shopping check
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    # 12. Parcel delivery boxes & online order check
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=800&q=80",
]

def download_photos():
    out_dir = r"D:\project\hiu-hiu backend\media\shops"
    os.makedirs(out_dir, exist_ok=True)
    headers = {"User-Agent": "Mozilla/5.0"}

    for idx, url in enumerate(PHOTO_URLS, start=1):
        out_path = os.path.join(out_dir, f"antiscam_case_{idx}.png")
        try:
            res = requests.get(url, headers=headers, timeout=15)
            res.raise_for_status()
            img = Image.open(io.BytesIO(res.content)).convert("RGB")
            img = img.resize((800, 500), Image.Resampling.LANCZOS)
            img.save(out_path, "PNG", optimize=True)
            print(f"[{idx}/12] Saved real photo -> {out_path}")
        except Exception as e:
            print(f"[{idx}/12] Failed ({e})")

if __name__ == "__main__":
    download_photos()
