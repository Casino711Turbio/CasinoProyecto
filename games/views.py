# views.py completo y corregido
from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Game, GameSession
from .serializers import GameSerializer, GameSessionSerializer
from players.models import Player
import random

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def play(self, request, pk=None):
        try:
            game = self.get_object()
            player = Player.objects.get(user=request.user)
            
            # Convertir a Decimal en lugar de float
            bet_amount = Decimal(str(request.data.get('bet_amount', 0)))

            if bet_amount <= Decimal('0'):
                return Response(
                    {'error': 'El monto de apuesta debe ser mayor a 0'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if player.balance < bet_amount:
                return Response(
                    {'error': 'Saldo insuficiente'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Lógica del juego
            if random.choice([True, False]):
                # Ganar: doble del monto apostado
                amount_won = bet_amount * Decimal('2')
                player.balance += amount_won
                result = 'won'
            else:
                amount_won = Decimal('0')
                player.balance -= bet_amount
                result = 'lost'

            player.save()

            # Crear GameSession
            game_session = GameSession.objects.create(
                player=player,
                game=game,
                bet_amount=bet_amount,
                amount_won=amount_won,
                result=result,
                end_time=timezone.now()
            )

            return Response({
                'result': result,
                'amount_won': float(amount_won),  # Convertir a float solo para la respuesta
                'new_balance': float(player.balance),
                'game_session_id': game_session.id,
                'message': f'¡{"Ganaste" if result == "won" else "Perdiste"} ${float(amount_won):.2f}!'
            })

        except Player.DoesNotExist:
            return Response(
                {'error': 'Perfil de jugador no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Game.DoesNotExist:
            return Response(
                {'error': 'Juego no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': f'Error interno del servidor: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Validar que se envíe game_id al crear una sesión
        """
        game_id = request.data.get('game')
        if not game_id:
            return Response(
                {'error': 'El campo "game" (ID del juego) es requerido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return Response(
                {'error': 'Juego no encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        return super().create(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return GameSession.objects.all().order_by('-start_time')
        
        try:
            player = Player.objects.get(user=user)
            return GameSession.objects.filter(player=player).order_by('-start_time')
        except Player.DoesNotExist:
            return GameSession.objects.none()

    def perform_create(self, serializer):
        try:
            player = Player.objects.get(user=self.request.user)
            serializer.save(player=player)
        except Player.DoesNotExist:
            from rest_framework import serializers
            raise serializers.ValidationError("Perfil de jugador no encontrado")

class GameListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def player_game_history(request):
    try:
        player = Player.objects.get(user=request.user)
        game_sessions = GameSession.objects.filter(player=player).order_by('-start_time')
        
        serializer = GameSessionSerializer(game_sessions, many=True)
        
        total_games = game_sessions.count()
        games_won = game_sessions.filter(result='won').count()
        total_wagered = sum(session.bet_amount for session in game_sessions)
        total_won = sum(session.amount_won for session in game_sessions)
        
        return Response({
            'game_sessions': serializer.data,
            'statistics': {
                'total_games': total_games,
                'games_won': games_won,
                'win_rate': round((games_won / total_games * 100), 2) if total_games > 0 else 0,
                'total_wagered': float(total_wagered),
                'total_won': float(total_won),
                'net_profit': float(total_won - total_wagered)
            }
        })
    
    except Player.DoesNotExist:
        return Response(
            {'error': 'Perfil de jugador no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
@transaction.atomic
def end_game_session(request, session_id):
    try:
        game_session = GameSession.objects.get(id=session_id)
        
        player = Player.objects.get(user=request.user)
        if game_session.player != player:
            return Response(
                {'error': 'No tienes permiso para esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        if game_session.end_time:
            return Response(
                {'error': 'Esta sesión de juego ya ha finalizado'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convertir a Decimal
        amount_won = Decimal(str(request.data.get('amount_won', 0)))
        
        game_session.end_time = timezone.now()
        game_session.result = request.data.get('result', 'completed')
        game_session.amount_won = amount_won
        
        if not game_session.result:
            net_change = amount_won - game_session.bet_amount
            player.balance += net_change
            player.save()
        
        game_session.save()
        
        serializer = GameSessionSerializer(game_session)
        return Response(serializer.data)
    
    except GameSession.DoesNotExist:
        return Response(
            {'error': 'Sesión de juego no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Player.DoesNotExist:
        return Response(
            {'error': 'Perfil de jugador no encontrado'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error interno del servidor: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )