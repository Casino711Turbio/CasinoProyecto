from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Player
from backend.apps.memberships.serializers import MembershipSerializer
import qrcode
from io import BytesIO
from django.core.files import File
import os

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    membership = MembershipSerializer(read_only=True)
    
    class Meta:
        model = Player
        fields = '__all__'
        read_only_fields = ('qr_code', 'join_date', 'balance')

    def create(self, validated_data):
        # Extraer datos del usuario
        user_data = validated_data.pop('user')
        
        # Crear usuario
        user_serializer = UserSerializer(data=user_data)
        if user_serializer.is_valid():
            user = user_serializer.save()
        else:
            raise serializers.ValidationError(user_serializer.errors)
        
        # Obtener membresía Free por defecto
        from backend.apps.memberships.models import Membership
        free_membership = Membership.objects.filter(name='Free').first()
        if not free_membership:
            # Si no existe, crear una
            free_membership = Membership.objects.create(
                name='Free',
                description='Membresía básica gratuita',
                benefits='Acceso a juegos básicos, promociones limitadas'
            )
        
        # Crear jugador (sin guardar aún)
        player = Player(
            user=user,
            membership=free_membership,
            **validated_data
        )
        
        # Guardar el jugador para obtener un ID
        player.save()
        
        # Generar código QR DESPUÉS de guardar (para tener el ID)
        self.generate_qr_code(player)
        
        return player

    def generate_qr_code(self, player):
        """Genera y guarda el código QR para un jugador"""
        try:
            # Crear datos del QR
            qr_data = f"player:{player.id}"
            print(f"Generando QR para jugador {player.id} con datos: {qr_data}")
            
            # Generar QR
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)
            
            # Crear imagen
            qr_image = qr.make_image(fill_color="black", back_color="white")
            
            # Guardar en buffer
            buffer = BytesIO()
            qr_image.save(buffer, format='PNG')
            buffer.seek(0)  # Volver al inicio del buffer
            
            # Crear nombre de archivo
            filename = f'qr_player_{player.id}.png'
            print(f"Guardando QR como: {filename}")
            
            # Guardar archivo
            player.qr_code.save(filename, File(buffer), save=False)
            player.save()  # Guardar explícitamente
            
            print(f"QR guardado exitosamente en: {player.qr_code.url}")
            
        except Exception as e:
            print(f"Error generando QR: {e}")
            import traceback
            traceback.print_exc()

    def update(self, instance, validated_data):
        # Manejar actualización de usuario si se proporciona
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            
            if 'username' in user_data:
                user.username = user_data['username']
            if 'password' in user_data:
                user.set_password(user_data['password'])
            
            user.save()
        
        # Actualizar otros campos del jugador
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance