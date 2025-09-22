from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Player
from memberships.serializers import MembershipSerializer

# Serializer para el User de Django (para manejar el username y password)
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

# Serializer para el modelo Player
class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Anidamos el UserSerializer
    membership = MembershipSerializer(read_only=True)  # Solo lectura para la membresía

    class Meta:
        model = Player
        fields = '__all__'
        read_only_fields = ('qr_code', 'join_date')

    def create(self, validated_data):
        # Extraer datos del usuario
        user_data = validated_data.pop('user')
        
        # Crear usuario
        user_serializer = UserSerializer(data=user_data)
        if user_serializer.is_valid():
            user = user_serializer.save()
        else:
            raise serializers.ValidationError(user_serializer.errors)
        
        # Crear jugador
        player = Player.objects.create(user=user, **validated_data)
        
        # Generar código QR
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(f"player:{player.id}")
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Guardar imagen QR
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        
        player.qr_code.save(f'qr_{player.id}.png', File(buffer), save=True)
        player.save()
        
        return player

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