from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from backend.apps.players.models import Player
from backend.apps.memberships.models import Membership
from backend.apps.players.serializers import PlayerSerializer

class RegisterView(generics.CreateAPIView):
    authentication_classes = []  # IMPORTANTE: Desactiva la autenticación
    permission_classes = [permissions.AllowAny]  # IMPORTANTE: Permite acceso sin autenticación

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
            
            # Obtener membresía Free por defecto
            free_membership = Membership.objects.get(name='Free')
            
            # Crear jugador
            player = Player.objects.create(
                user=user,
                name=name,
                last_name=last_name,
                membership=free_membership
            )
            
            serializer = PlayerSerializer(player)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )