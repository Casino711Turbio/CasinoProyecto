from rest_framework import generics, status, views
from rest_framework.response import Response
from django.contrib.auth.models import User
from players.models import Player
from memberships.models import Membership
from players.serializers import PlayerSerializer
from django.http import JsonResponse
import bcrypt

class RegisterView(generics.CreateAPIView):

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
        
def index(request):
    return JsonResponse({"message": "Auth API funcionando ✅"})