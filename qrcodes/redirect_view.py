from django.shortcuts import redirect, get_object_or_404
from .models import QRCode


def qr_redirect(request, short_code):
    qr = get_object_or_404(QRCode, short_code=short_code)
    qr.scan_count += 1
    qr.save(update_fields=['scan_count'])
    return redirect(qr.destination_url)
