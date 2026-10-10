from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BannerViewSet,
    RiskRecordViewSet,
    ShopViewSet,
    ReviewViewSet,
    check_shop_risk,
    csrf_token,
    register,
    login_view,
    logout_view,
    current_user,
    update_profile,
    report_risk,
)

router = DefaultRouter()
router.register(r'shops', ShopViewSet)
router.register(r'risk-records', RiskRecordViewSet)
router.register(r'banners', BannerViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('check-risk/', check_shop_risk, name='check-risk'),
    path('auth/csrf/', csrf_token, name='auth-csrf'),
    path('auth/register/', register, name='auth-register'),
    path('auth/login/', login_view, name='auth-login'),
    path('auth/logout/', logout_view, name='auth-logout'),
    path('auth/me/', current_user, name='auth-me'),
    path('auth/update-profile/', update_profile, name='auth-update-profile'),
    path('report-risk/', report_risk, name='report-risk'),
]