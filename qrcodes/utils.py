import io
import string
import random
import qrcode


def generate_short_code(length=7):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choices(chars, k=length))


def generate_qr_image(url, fg_color='#000000', bg_color='#ffffff'):
    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fg_color, back_color=bg_color)
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer
