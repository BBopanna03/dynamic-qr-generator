from django.db import models
from django.conf import settings
import uuid


class QRCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='qrcodes', null=True)
    name = models.CharField(max_length=200)
    destination_url = models.URLField(max_length=2000)
    short_code = models.CharField(max_length=20, unique=True)
    qr_image = models.URLField(blank=True)   # Cloudinary permanent URL
    scan_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    fg_color = models.CharField(max_length=7, default='#000000')
    bg_color = models.CharField(max_length=7, default='#ffffff')

    def __str__(self):
        return self.name
