from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction, models
from django.db.models import F
from .models import Player
from .serializers import PlayerSerializer
import qrcode
from io import BytesIO
from django.core.files import File
from django.shortcuts import get_object_or_404
from decimal import Decimal

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
    @transaction.atomic
    def add_balance(self, request, pk=None):
        """
        Agregar saldo a un jugador (solo admin o el propio jugador) - FORMA SEGURA
        """
        player = self.get_object()
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        amount = request.data.get('amount')
        if amount is None or Decimal(amount) <= 0:
            return Response(
                {'error': 'Monto inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar balance de forma atómica
        decimal_amount = Decimal(amount)
        Player.objects.filter(id=player.id).update(
            balance=F('balance') + decimal_amount
        )
        
        # Obtener el jugador actualizado
        player.refresh_from_db()
        
        return Response({
            'message': f'Se agregaron ${decimal_amount:.2f} al saldo',
            'new_balance': str(player.balance)  # Mantener como string para precisión
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def withdraw_balance(self, request, pk=None):
        """
        Retirar saldo de un jugador (solo admin o el propio jugador) - FORMA SEGURA
        """
        player = self.get_object()
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        amount = request.data.get('amount')
        if amount is None or Decimal(amount) <= 0:
            return Response(
                {'error': 'Monto inválido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        decimal_amount = Decimal(amount)
        
        # Verificar saldo y retirar de forma atómica
        updated = Player.objects.filter(
            id=player.id, 
            balance__gte=decimal_amount
        ).update(
            balance=F('balance') - decimal_amount
        )
        
        if not updated:
            return Response(
                {'error': 'Saldo insuficiente'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el jugador actualizado
        player.refresh_from_db()
        
        return Response({
            'message': f'Se retiraron ${decimal_amount:.2f} del saldo',
            'new_balance': str(player.balance)  # Mantener como string para precisión
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
        
        return Response({'balance': str(player.balance)})  # Mantener como string
    
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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_balance_endpoint(self, request):
        """
        Obtener balance del jugador actual - Versión mejorada con más detalles
        """
        try:
            player = Player.objects.get(user=request.user)
            return Response({
                'success': True,
                'balance': str(player.balance),
                'currency': player.currency,
                'player_id': player.id,
                'username': player.user.username,
                'player_name': f"{player.name} {player.last_name}" if player.name and player.last_name else player.user.username
            })
        except Player.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Jugador no encontrado',
                'detail': 'No existe un perfil de jugador para este usuario'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'No se pudo obtener el balance',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_full_profile(self, request):
        """
        Obtener perfil completo del jugador con todos los detalles
        """
        try:
            player = Player.objects.get(user=request.user)
            return Response({
                'success': True,
                'id': player.id,
                'username': player.user.username,
                'email': player.user.email,
                'balance': str(player.balance),
                'currency': player.currency,
                'status': player.status,
                'created_at': player.created_at,
                'name': player.name,
                'last_name': player.last_name,
                'phone': player.phone,
                'identification': player.identification,
                'total_wins': str(player.total_wins) if hasattr(player, 'total_wins') else "0",
                'total_losses': str(player.total_losses) if hasattr(player, 'total_losses') else "0",
                'player_name': f"{player.name} {player.last_name}" if player.name and player.last_name else player.user.username
            })
        except Player.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Perfil de jugador no encontrado',
                'detail': 'No existe un perfil de jugador para este usuario'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': 'No se pudo obtener el perfil',
                'detail': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

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
@transaction.atomic
def update_balance(request, player_id):
    """
    Endpoint para actualizar el saldo de un jugador (requiere autenticación) - FORMA SEGURA
    """
    try:
        player = get_object_or_404(Player, id=player_id)
        
        # Verificar permisos: admin o el propio jugador
        if not (request.user.is_staff or player.user == request.user):
            return Response(
                {'error': 'No tienes permiso para realizar esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Convertir a Decimal
        amount = Decimal(str(request.data.get('amount', 0)))
        action_type = request.data.get('action', 'add')  # 'add' o 'subtract'
        
        if action_type == 'add':
            # Actualizar de forma atómica
            Player.objects.filter(id=player.id).update(
                balance=F('balance') + amount
            )
            message = f'Se agregaron ${amount:.2f} al saldo'
        elif action_type == 'subtract':
            # Verificar saldo y restar de forma atómica
            updated = Player.objects.filter(
                id=player.id, 
                balance__gte=amount
            ).update(
                balance=F('balance') - amount
            )
            
            if not updated:
                return Response(
                    {'error': 'Saldo insuficiente'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            message = f'Se retiraron ${amount:.2f} del saldo'
        else:
            return Response(
                {'error': 'Acción inválida'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Obtener el jugador actualizado
        player.refresh_from_db()
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

# ============ ENDPOINTS DIRECTO PARA REACT ============

# En views.py de players
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_balance(request):
    """
    Obtener balance del jugador actual - Endpoint directo para React
    """
    try:
        print(f"🔍 DEBUG: Usuario autenticado: {request.user.username}")
        
        # Verificar si el usuario tiene un Player
        if not hasattr(request.user, 'player'):
            print(f"❌ ERROR: Usuario {request.user.username} no tiene objeto Player")
            return Response({
                'success': False,
                'error': 'Perfil de jugador no encontrado',
                'detail': 'No existe un perfil de jugador para este usuario'
            }, status=status.HTTP_404_NOT_FOUND)
        
        player = request.user.player
        print(f"✅ Player encontrado: ID={player.id}, Balance={player.balance}")
        
        # Usar getattr para evitar errores con campos que puedan no existir
        return Response({
            'success': True,
            'balance': str(player.balance) if player.balance is not None else "0.00",
            'currency': getattr(player, 'currency', 'USD'),  # Campo opcional
            'player_id': player.id,
            'username': player.user.username,
            'player_name': f"{player.name} {player.last_name}".strip() or player.user.username
        })
        
    except Exception as e:
        print(f"🔥 EXCEPCIÓN en get_my_balance: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'success': False,
            'error': 'No se pudo obtener el balance',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_my_profile(request):
    """
    Obtener perfil completo del jugador - Endpoint directo para React
    """
    try:
        player = Player.objects.get(user=request.user)
        return Response({
            'success': True,
            'id': player.id,
            'username': player.user.username,
            'email': player.user.email,
            'balance': str(player.balance),
            'currency': player.currency,
            'status': player.status,
            'created_at': player.created_at,
            'name': player.name,
            'last_name': player.last_name,
            'phone': player.phone,
            'identification': player.identification,
            'total_wins': str(player.total_wins) if hasattr(player, 'total_wins') else "0",
            'total_losses': str(player.total_losses) if hasattr(player, 'total_losses') else "0",
            'player_name': f"{player.name} {player.last_name}" if player.name and player.last_name else player.user.username
        })
    except Player.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Perfil de jugador no encontrado',
            'detail': 'No existe un perfil de jugador para este usuario'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': 'No se pudo obtener el perfil',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

# Ya tienes este endpoint, pero lo mantenemos por compatibilidad
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_balance(request):
    """
    Obtener el saldo del jugador autenticado - Mantenido por compatibilidad
    """
    try:
        player = Player.objects.get(user=request.user)
        return Response({
            'balance': str(player.balance),
            'player_name': f"{player.name} {player.last_name}" if player.name and player.last_name else player.user.username
        })
    except Player.DoesNotExist:
        return Response(
            {'error': 'Jugador no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )