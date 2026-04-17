from django.contrib import admin
from .models import QRCode


@admin.register(QRCode)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_code', 'destination_url', 'scan_count', 'created_at')
    readonly_fields = ('id', 'short_code', 'qr_image', 'scan_count', 'created_at')
    search_fields = ('name', 'short_code')
