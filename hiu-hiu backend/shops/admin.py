from django.contrib import admin
from .models import Banner, RiskRecord, Shop


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'sort_order', 'created_at')
    list_filter = ('is_active',)

@admin.register(Shop)
class ShopAdmin(admin.ModelAdmin):
    list_display = ('name', 'platform', 'status', 'created_at') # คอลัมน์ที่จะแสดง
    list_filter = ('platform', 'status') # เพิ่มตัวกรองด้านขวามือ
    search_fields = ('name', 'url') # เพิ่มช่องค้นหาชื่อร้าน


@admin.register(RiskRecord)
class RiskRecordAdmin(admin.ModelAdmin):
    list_display = ('identifier', 'identifier_type', 'status', 'source_name', 'is_active', 'updated_at')
    list_filter = ('identifier_type', 'status', 'is_active')
    search_fields = ('identifier', 'source_name', 'notes')
    readonly_fields = ('normalized_identifier', 'created_at', 'updated_at')