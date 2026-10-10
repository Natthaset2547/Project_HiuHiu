import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

print("Fixing the dead Twitter food shops...")
# Replace Bearhouse Twitter with GUGU Chicken
bad_bearhouse = Shop.objects.filter(url__icontains="twitter.com/bearhouseth").first()
if bad_bearhouse:
    bad_bearhouse.name = "GUGU Chicken"
    bad_bearhouse.url = "https://twitter.com/GUGUChickenTH"
    bad_bearhouse.description = "GUGU Chicken 🍗\n• ไก่ทอดเกาหลี ของกิน อาหาร ขนม"
    bad_bearhouse.save()
    print("Replaced Bearhouse with GUGU Chicken")

# Replace PlantoMonster Twitter with Krispy Kreme
bad_planto = Shop.objects.filter(url__icontains="twitter.com/plantomonster").first()
if bad_planto:
    bad_planto.name = "Krispy Kreme Thailand"
    bad_planto.url = "https://twitter.com/KrispyKremeTH"
    bad_planto.description = "Krispy Kreme Thailand 🍩\n• โดนัท คริสปี้ครีม ของกิน ขนม หวานอร่อย"
    bad_planto.save()
    print("Replaced Planto Monster with Krispy Kreme")


print("Updating descriptions to support multiple categories...")

# Define category keywords mapped to shop types
rules = {
    'fashion': ' เสื้อผ้า แฟชั่น กางเกง รองเท้า เครื่องประดับ ',
    'bag': ' กระเป๋า ',
    'cosmetic': ' สกินแคร์ เครื่องสำอาง ',
    'food': ' ของกิน ขนม อาหารเสริม ',
    'toy': ' art toy ของเล่น ฟิกเกอร์ ',
    'kpop': ' k-pop อัลบั้ม ศิลปิน ',
    'preorder': ' รับหิ้ว พรีออเดอร์ '
}

# Manual overrides for specific shops to hit multiple categories
multi_categories = {
    "Wink White": rules['cosmetic'] + rules['food'],
    "EVEANDBOY": rules['cosmetic'] + rules['bag'] + rules['fashion'],
    "BEAUTRIUM": rules['cosmetic'],
    "GENTLEWOMAN": rules['fashion'] + rules['bag'],
    "Matchbox": rules['fashion'] + rules['bag'] + rules['cosmetic'],
    "Kloset & Etcetera": rules['fashion'] + rules['bag'] + rules['cosmetic'],
    "CAMP BKK": rules['fashion'] + rules['bag'] + rules['cosmetic'],
    "Ktown4u": rules['kpop'] + rules['toy'] + rules['preorder'],
    "SM True": rules['kpop'] + rules['toy'],
    "POP MART": rules['toy'] + rules['preorder'],
    "Pre-order Korea": rules['preorder'] + rules['fashion'] + rules['cosmetic'],
    "NCT Dream": rules['kpop'] + rules['preorder'],
    "Carnival Store": rules['fashion'] + rules['bag'],
    "Merge Official": rules['fashion'],
    "Rally Movement": rules['fashion'] + rules['bag'],
    "Fallen Angels": rules['fashion'] + rules['bag'] + rules['preorder'],
    "K-Pop Merch": rules['kpop'] + rules['preorder'],
    "Bunjang": rules['preorder'] + rules['kpop'] + rules['toy'],
    "Animate": rules['toy'] + rules['preorder'],
    "Kinokuniya": rules['toy'],
}

shops = Shop.objects.all()
updated_count = 0

for shop in shops:
    # Remove old injected keywords if we run this multiple times
    original_desc = shop.description.split('\n[Tags:')[0] if shop.description else ""
    
    tags = ""
    # Check if the shop name matches our manual overrides
    for key, value in multi_categories.items():
        if key.lower() in shop.name.lower() or key.lower() in original_desc.lower():
            tags += value
            
    # Default tags based on keywords already in the description
    desc_lower = original_desc.lower()
    if not tags:
        if any(w in desc_lower for w in ['เสื้อ', 'กางเกง', 'รองเท้า', 'fashion']):
            tags += rules['fashion']
        if any(w in desc_lower for w in ['กระเป๋า', 'bag']):
            tags += rules['bag']
        if any(w in desc_lower for w in ['เครื่องสำอาง', 'สกินแคร์', 'beauty']):
            tags += rules['cosmetic']
        if any(w in desc_lower for w in ['อาหาร', 'ขนม', 'สลัด', 'food']):
            tags += rules['food']
        if any(w in desc_lower for w in ['kpop', 'k-pop', 'เกาหลี', 'บัตร']):
            tags += rules['kpop']
            
    # Remove duplicate words in tags
    unique_tags = " ".join(list(set(tags.split())))
    
    if unique_tags:
        # Append tags invisibly or at the bottom
        shop.description = f"{original_desc.strip()}\n\n[Tags: {unique_tags}]"
        shop.save()
        updated_count += 1

print(f"Updated multi-category keywords for {updated_count} shops!")
