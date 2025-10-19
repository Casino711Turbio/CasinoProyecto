from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from backend.apps.players.models import Player
from backend.apps.memberships.models import MembershipPlan, Membership
from backend.apps.players.serializers import PlayerSerializer
from django.utils import timezone
from datetime import timedelta

class RegisterView(generics.CreateAPIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            name = request.data.get('name')
            last_name = request.data.get('last_name')
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=username).exists():
                return Response(
                    {'error': 'El nombre de usuario ya existe'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Crear usuario
            user = User.objects.create_user(
                username=username, 
                password=password
            )
            
            # ✅ CORREGIDO: Obtener plan Free por defecto (bronze)
            free_plan = MembershipPlan.objects.filter(tier='bronze').first()
            if not free_plan:
                # Si no existe, crear un plan básico
                free_plan = MembershipPlan.objects.create(
                    name="Plan Básico",
                    tier="bronze",
                    description="Plan gratuito para nuevos jugadores",
                    benefits={"juegos_basicos": True},
                    min_balance=0,
                    min_monthly_volume=0,
                    valid_from=timezone.now(),
                    is_active=True
                )
            
            # ✅ CORREGIDO: Crear jugador (sin membership en el constructor)
            player = Player.objects.create(
                user=user,
                name=name,
                last_name=last_name
                
            )
            
            # ✅ CORREGIDO: Crear membresía para el jugador
            membership = Membership.objects.create(
                player=player,
                plan=free_plan,
                expires_at=timezone.now() + timedelta(days=30),  # 30 días de membresía
                is_active=True
            )
            
            serializer = PlayerSerializer(player)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )