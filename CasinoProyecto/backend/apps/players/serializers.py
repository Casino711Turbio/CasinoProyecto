from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Player
from backend.apps.memberships.serializers import PlayerMembershipSerializer
import qrcode
from io import BytesIO
from django.core.files import File

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),  # Añadir email
            password=validated_data['password']
        )
        return user

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    membership = PlayerMembershipSerializer(source='player_membership', read_only=True) 
    
    class Meta:
        model = Player
        fields = ['id', 'user', 'username', 'email', 'name', 'last_name', 'qr_code', 
                 'join_date', 'balance', 'membership']
        read_only_fields = ('qr_code', 'join_date', 'balance')

    @transaction.atomic
    def create(self, validated_data):
        # Extraer datos del usuario
        user_data = validated_data.pop('user')
        
        # Crear usuario con email
        user = User.objects.create_user(
            username=user_data['username'],
            email=user_data.get('email', ''),
            password=user_data['password']
        )
        
        # Obtener membresía Free por defecto
        from backend.apps.memberships.models import MembershipPlan, Membership
        free_plan = MembershipPlan.objects.filter(tier='bronze').first()
        if not free_plan:
            from django.utils import timezone
            free_plan = MembershipPlan.objects.create(
                name='Free',
                tier='bronze',
                description='Membresía básica gratuita',
                benefits='Acceso a juegos básicos',
                min_balance=0,
                min_monthly_volume=0,
                valid_from=timezone.now(),
                is_active=True
            )
        
        # Crear jugador
        player = Player.objects.create(
            user=user,
            **validated_data
        )
        
        # Crear membresía para el jugador
        Membership.objects.create(
            player=player,
            plan=free_plan,
            expires_at=timezone.now() + timezone.timedelta(days=30),
            is_active=True
        )
        
        # Generar código QR
        self.generate_qr_code(player)
        
        return player

    def generate_qr_code(self, player):
        """Genera y guarda el código QR para un jugador"""
        try:
            # Crear datos del QR
            qr_data = f"player:{player.id}"
            
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
            buffer.seek(0)
            
            # Crear nombre de archivo
            filename = f'qr_player_{player.id}.png'
            
            # Guardar archivo
            player.qr_code.save(filename, File(buffer), save=True)
            
        except Exception as e:
            print(f"Error generando QR: {e}")

    def update(self, instance, validated_data):
        # Manejar actualización de usuario si se proporciona
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            user = instance.user
            
            if 'username' in user_data:
                user.username = user_data['username']
            if 'email' in user_data:
                user.email = user_data['email']
            if 'password' in user_data:
                user.set_password(user_data['password'])
            
            user.save()
        
        # Actualizar otros campos del jugador
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance