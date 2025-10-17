from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Player
from .serializers import PlayerSerializer
import qrcode
from io import BytesIO
from django.core.files import File
from django.shortcuts import get_object_or_404
from decimal import Decimal  # Importación añadida

class PlayerViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar jugadores con permisos adecuados
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

    def get_permissions(self):
        """
        Configura permisos específicos para cada acción
        """
        if self.action in ['list', 'retrieve', 'qr_code']:
            # Listar, ver detalles y QR son públicos
            self.permission_classes = [permissions.AllowAny]
        elif self.action in ['create']:
            # Crear jugadores requiere autenticación (admin)
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            # Actualizar, eliminar y acciones de balance requieren autenticación
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def get_queryset(self):
        """
        Filtra el queryset basado en el usuario autenticado
        """
        user = self.request.user
        if user.is_staff:
            # Los administradores ven todos los jugadores
            return Player.objects.all()
        elif user.is_authenticated:
            # Los usuarios autenticados ven solo su propio perfil
            return Player.objects.filter(user=user)
        else:
            # Usuarios no autenticados ven lista vacía (solo pueden ver detalles específicos)
            return Player.objects.none()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_balance(self, request, pk=None):
        """
        Agregar saldo a un jugador (solo admin o el propio jugador)
        """
        player = self.get_object()
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        amount = request.data.get('amount')
        if amount is None or Decimal(amount) <= 0:  # Cambiado a Decimal
            return Response(
                {'error': 'Monto inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Usar Decimal en lugar de float
        player.balance += Decimal(amount)
        player.save()
        
        return Response({
            'message': f'Se agregaron ${float(amount):.2f} al saldo',
            'new_balance': float(player.balance)
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def withdraw_balance(self, request, pk=None):
        """
        Retirar saldo de un jugador (solo admin o el propio jugador)
        """
        player = self.get_object()
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        amount = request.data.get('amount')
        if amount is None or Decimal(amount) <= 0:  # Cambiado a Decimal
            return Response(
                {'error': 'Monto inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if player.balance < Decimal(amount):  # Cambiado a Decimal
            return Response(
                {'error': 'Saldo insuficiente'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Usar Decimal en lugar de float
        player.balance -= Decimal(amount)
        player.save()
        
        return Response({
            'message': f'Se retiraron ${float(amount):.2f} del saldo',
            'new_balance': float(player.balance)
        })

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def get_balance(self, request, pk=None):
        """
        Obtener saldo de un jugador (solo admin o el propio jugador)
        """
        player = self.get_object()
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        return Response({'balance': float(player.balance)})
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def qr_code(self, request, pk=None):
        """
        Obtener URL del código QR de un jugador (público)
        """
        player = get_object_or_404(Player, pk=pk)
        if player.qr_code:
            return Response({'qr_code_url': player.qr_code.url})
        return Response(
            {'error': 'Código QR no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_profile(self, request):
        """
        Obtener el perfil del jugador autenticado
        """
        try:
            player = Player.objects.get(user=request.user)
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        except Player.DoesNotExist:
            return Response(
                {'error': 'Perfil de jugador no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def scan_qr(request):
    """
    Endpoint para escanear códigos QR de jugadores (público)
    """
    try:
        qr_data = request.data.get('qr_data', '')
        
        # Decodificar datos del QR (formato: "player:{id}")
        if qr_data.startswith('player:'):
            player_id = qr_data.split(':')[1]
            player = get_object_or_404(Player, id=player_id)
            
            serializer = PlayerSerializer(player)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Formato de QR inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_balance(request, player_id):
    """
    Endpoint para actualizar el saldo de un jugador (requiere autenticación)
    """
    try:
        player = get_object_or_404(Player, id=player_id)
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Convertir a Decimal en lugar de float
        amount = Decimal(str(request.data.get('amount', 0)))
        action_type = request.data.get('action', 'add')  # 'add' o 'subtract'
        
        if action_type == 'add':
            player.balance += amount
            message = f'Se agregaron ${float(amount):.2f} al saldo'
        elif action_type == 'subtract':
            if player.balance >= amount:
                player.balance -= amount
                message = f'Se retiraron ${float(amount):.2f} del saldo'
            else:
                return Response(
                    {'error': 'Saldo insuficiente'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            return Response(
                {'error': 'Acción inválida'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        player.save()
        serializer = PlayerSerializer(player)
        
        return Response({
            'message': message,
            'data': serializer.data
        })
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_balance(request):
    """
    Obtener el saldo del jugador autenticado
    """
    try:
        player = Player.objects.get(user=request.user)
        return Response({
            'balance': float(player.balance),
            'player_name': f"{player.name} {player.last_name}"
        })
    except Player.DoesNotExist:
        return Response(
            {'error': 'Jugador no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )