import os
from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
import cloudinary.uploader

from .models import QRCode
from .utils import generate_short_code, generate_qr_image


def _serialize(qr):
    return {
        'id': str(qr.id),
        'name': qr.name,
        'destination_url': qr.destination_url,
        'short_code': qr.short_code,
        'qr_image': qr.qr_image,
        'scan_count': qr.scan_count,
        'fg_color': qr.fg_color,
        'bg_color': qr.bg_color,
        'created_at': qr.created_at.isoformat(),
    }


class QRCodeViewSet(ViewSet):

    def list(self, request):
        qrcodes = QRCode.objects.all().order_by('-created_at')
        return Response([_serialize(q) for q in qrcodes])

    def create(self, request):
        name = request.data.get('name', '').strip()
        destination_url = request.data.get('destination_url', '').strip()
        fg_color = request.data.get('fg_color', '#000000')
        bg_color = request.data.get('bg_color', '#ffffff')

        if not name or not destination_url:
            return Response(
                {'error': 'name and destination_url are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        short = generate_short_code()
        base = os.environ.get('BASE_URL', 'http://localhost:8000')
        redirect_url = f"{base}/r/{short}/"

        img_buffer = generate_qr_image(redirect_url, fg_color, bg_color)

        upload = cloudinary.uploader.upload(
            img_buffer,
            folder='qr_codes',
            public_id=short,
            resource_type='image',
        )

        qr = QRCode.objects.create(
            name=name,
            destination_url=destination_url,
            short_code=short,
            qr_image=upload['secure_url'],
            fg_color=fg_color,
            bg_color=bg_color,
        )

        return Response(_serialize(qr), status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        qr = get_object_or_404(QRCode, pk=pk)
        return Response(_serialize(qr))

    def partial_update(self, request, pk=None):
        qr = get_object_or_404(QRCode, pk=pk)
        qr.name = request.data.get('name', qr.name)
        qr.destination_url = request.data.get('destination_url', qr.destination_url)
        qr.fg_color = request.data.get('fg_color', qr.fg_color)
        qr.bg_color = request.data.get('bg_color', qr.bg_color)
        qr.save()
        return Response(_serialize(qr))

    def destroy(self, request, pk=None):
        qr = get_object_or_404(QRCode, pk=pk)
        qr.delete()
        return Response({'msg': 'deleted'}, status=status.HTTP_204_NO_CONTENT)
