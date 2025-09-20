from rest_framework import viewsets
from .models import Game, GameSession
from .serializers import GameSerializer, GameSessionSerializer
import random
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions
from players.models import Player
from django.utils import timezone
from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

class GameViewSet(viewsets.ModelViewSet):
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    @action(detail=True, methods=['post'])
    def play(self, request, pk=None):
        game = self.get_object()
        player_id = request.data.get('player_id')
        bet_amount = float(request.data.get('bet_amount', 0))

        if not player_id or bet_amount <= 0:
            return Response({'error': 'Invalid parameters'}, status=status.HTTP_400_BAD_REQUEST)

        player = Player.objects.get(id=player_id)
        if player.balance < bet_amount:
            return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)

        # Lógica simple de juego (ganar o perder aleatoriamente)
        if random.choice([True, False]):
            # Ganar: doble del monto apostado
            amount_won = bet_amount * 2
            player.balance += amount_won
            result = 'won'
        else:
            amount_won = 0
            player.balance -= bet_amount
            result = 'lost'

        player.save()

        # Registrar la sesión de juego
        game_session = GameSession.objects.create(
            player=player,
            game=game,
            bet_amount=bet_amount,
            amount_won=amount_won,
            result=result
        )

        return Response({
            'result': result,
            'amount_won': amount_won,
            'new_balance': player.balance,
            'game_session_id': game_session.id
        })  
    

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer

    @action(detail=True, methods=['post'])
    def play(self, request, pk=None):
        game = self.get_object()
        player_id = request.data.get('player_id')
        bet_amount = float(request.data.get('bet_amount', 0))

        if not player_id or bet_amount <= 0:
            return Response({'error': 'Invalid parameters'}, status=status.HTTP_400_BAD_REQUEST)

        player = Player.objects.get(id=player_id)
        if player.balance < bet_amount:
            return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)

        # Lógica simple de juego (ganar o perder aleatoriamente)
        if random.choice([True, False]):
            # Ganar: doble del monto apostado
            amount_won = bet_amount * 2
            player.balance += amount_won
            result = 'won'
        else:
            amount_won = 0
            player.balance -= bet_amount
            result = 'lost'

        player.save()

        # Registrar la sesión de juego
        game_session = GameSession.objects.create(
            player=player,
            game=game,
            bet_amount=bet_amount,
            amount_won=amount_won,
            result=result
        )

        return Response({
            'result': result,
            'amount_won': amount_won,
            'new_balance': player.balance,
            'game_session_id': game_session.id
        })
    
class GameListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

class GameSessionCreateView(generics.CreateAPIView):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Obtener el jugador autenticado
        player = Player.objects.get(user=self.request.user)
        serializer.save(player=player)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_game_session(request, session_id):
    """
    Finalizar una sesión de juego y actualizar estadísticas
    """
    try:
        game_session = GameSession.objects.get(id=session_id)
        
        # Verificar que el jugador es el propietario de la sesión
        player = Player.objects.get(user=request.user)
        if game_session.player != player:
            return Response(
                {'error': 'No tienes permiso para esta acción'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Actualizar datos de la sesión
        game_session.end_time = timezone.now()
        game_session.result = request.data.get('result', '')
        game_session.amount_won = float(request.data.get('amount_won', 0))
        
        # Actualizar saldo del jugador
        player.balance += game_session.amount_won - game_session.bet_amount
        player.save()
        
        game_session.save()
        
        serializer = GameSessionSerializer(game_session)
        return Response(serializer.data)
    
    except GameSession.DoesNotExist:
        return Response(
            {'error': 'Sesión de juego no encontrada'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )