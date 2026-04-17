from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from qrcodes.views import QRCodeViewSet
from qrcodes.redirect_view import qr_redirect

router = DefaultRouter()
router.register(r'qrcodes', QRCodeViewSet, basename='qrcode')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('r/<str:short_code>/', qr_redirect),
]
