import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from django.contrib.auth.models import User 

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    join_date = models.DateTimeField(auto_now_add=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

    def __str__(self):
        return f"{self.name} {self.last_name}"

    def save(self, *args, **kwargs):
        # Generar código QR solo si es un nuevo jugador o no tiene QR
        if not self.qr_code:
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            # Usar datos más significativos para el QR
            qr_data = f"Player:{self.user.username}|Name:{self.name} {self.last_name}" if self.id else "Player:New"
            qr.add_data(qr_data)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")

            buffer = BytesIO()
            img.save(buffer, format='PNG')
            buffer.seek(0)

            # Solo guardar si tenemos un ID
            if self.id:
                self.qr_code.save(f'qr_{self.id}.png', File(buffer), save=False)

        super().save(*args, **kwargs)