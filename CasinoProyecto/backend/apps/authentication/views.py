from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from backend.apps.players.models import Player
from backend.apps.players.serializers import PlayerSerializer
from backend.apps.memberships.models import MembershipPlan, Membership
from django.utils import timezone
from datetime import timedelta
from rest_framework.views import APIView

class RegisterView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            email = request.data.get('email')
            name = request.data.get('name')
            last_name = request.data.get('last_name')
            
            # 1. Validaciones
            if not username or not password or not email:
                return Response(
                    {'error': 'Usuario, contraseña y correo son obligatorios'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'El nombre de usuario ya existe'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if User.objects.filter(email=email).exists():
                return Response(
                    {'error': 'Este correo electrónico ya está registrado'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 2. Crear usuario con email
            user = User.objects.create_user(
                username=username, 
                email=email,
                password=password
            )
            
            # Obtener plan Free (bronze)
            free_plan = MembershipPlan.objects.filter(tier='bronze').first()
            if not free_plan:
                free_plan = MembershipPlan.objects.create(
                    name="Plan Básico",
                    tier="bronze",
                    description="Plan gratuito",
                    benefits={"juegos_basicos": True},
                    min_balance=0,
                    min_monthly_volume=0,
                    valid_from=timezone.now(),
                    is_active=True
                )
            
            # Crear jugador
            player = Player.objects.create(
                user=user,
                name=name,
                last_name=last_name
            )
            
            # Crear membresía
            Membership.objects.create(
                player=player,
                plan=free_plan,
                expires_at=timezone.now() + timedelta(days=30),
                is_active=True
            )
            
            serializer = PlayerSerializer(player)
            return Response({
                'message': 'Usuario registrado exitosamente',
                'player': serializer.data,
                'player_id': player.id,
                'username': player.user.username,
                'email': player.user.email
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'El correo electrónico es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user_exists = User.objects.filter(email=email).exists()
        
        if user_exists:
            print(f"📧 SIMULACIÓN: Enviando correo de recuperación a {email}")
            # Aquí iría la lógica real de envío de email (django.core.mail)
        else:
            print(f"⚠️ Intento de recuperación para correo no registrado: {email}")

        # Siempre respondemos con éxito por seguridad
        return Response(
            {'message': 'Si el correo existe, recibirás un enlace de recuperación.'},
            status=status.HTTP_200_OK
        )

# Endpoint de registro alternativo (mantenemos para compatibilidad)
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Endpoint de registro alternativo"""
    try:
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        name = request.data.get('name')
        last_name = request.data.get('last_name')
        
        if not username or not password or not email:
            return Response(
                {'error': 'Usuario, contraseña y correo son obligatorios'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'error': 'El nombre de usuario ya existe'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'error': 'Este correo electrónico ya está registrado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = User.objects.create_user(
            username=username, 
            email=email,
            password=password
        )
        
        player = Player.objects.create(
            user=user,
            name=name,
            last_name=last_name
        )
        
        return Response({
            'message': 'Usuario registrado exitosamente',
            'player_id': player.id,
            'username': player.user.username,
            'email': player.user.email
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Error durante el registro: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )