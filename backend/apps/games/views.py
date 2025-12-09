from rest_framework import viewsets, generics, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from .models import Game, GameSession
from .serializers import GameSerializer, GameSessionSerializer
from backend.apps.players.models import Player
import random
import uuid
from django.core.cache import cache

# --- VARIABLES GLOBALES DE JUEGO ---
SLOT_SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '7️⃣']
SUITS = ['♠', '♥', '♦', '♣']
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
# -----------------------------------

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
            
            # Validar apuesta
            try:
                bet_amount = Decimal(str(request.data.get('bet_amount', 0)))
            except:
                return Response({'error': 'Monto inválido'}, status=status.HTTP_400_BAD_REQUEST)

            if bet_amount <= 0:
                return Response({'error': 'La apuesta debe ser mayor a 0'}, status=status.HTTP_400_BAD_REQUEST)

            if player.balance < bet_amount:
                return Response({'error': 'Saldo insuficiente'}, status=status.HTTP_400_BAD_REQUEST)

            # --- LÓGICA DE JUEGO ---
            game_data = {}
            amount_won = Decimal('0')
            result = 'lost'

            # 1. TRAGAMONEDAS
            if game.game_type == 'Máquina' or 'Tragamonedas' in game.name:
                reels = [random.choice(SLOT_SYMBOLS) for _ in range(3)]
                game_data = {'reels': reels}
                
                if reels[0] == reels[1] == reels[2]:
                    amount_won = bet_amount * Decimal('10')
                    result = 'won'
                elif reels[0] == reels[1] or reels[1] == reels[2] or reels[0] == reels[2]:
                    amount_won = bet_amount * Decimal('1.5')
                    result = 'won'

            # 2. BLACKJACK (versión simplificada de un solo turno)
            elif 'Blackjack' in game.name or game.game_type == 'Mesa':
                # Función auxiliar para sacar carta
                def get_card():
                    return {'rank': random.choice(RANKS), 'suit': random.choice(SUITS)}
                
                # Función auxiliar para calcular puntaje
                def calc_score(hand):
                    score = 0
                    aces = 0
                    for card in hand:
                        if card['rank'] in ['J', 'Q', 'K']: score += 10
                        elif card['rank'] == 'A': aces += 1; score += 11
                        else: score += int(card['rank'])
                    while score > 21 and aces:
                        score -= 10
                        aces -= 1
                    return score

                player_hand = [get_card(), get_card()]
                dealer_hand = [get_card(), get_card()]
                
                p_score = calc_score(player_hand)
                d_score = calc_score(dealer_hand)

                # Lógica simplificada
                if p_score == 21:
                    amount_won = bet_amount * Decimal('2.5')
                    result = 'won'
                elif d_score == 21:
                    amount_won = Decimal('0')
                    result = 'lost'
                else:
                    # Dealer pide hasta 17
                    while d_score < 17:
                        dealer_hand.append(get_card())
                        d_score = calc_score(dealer_hand)
                    
                    if d_score > 21 or p_score > d_score:
                        amount_won = bet_amount * Decimal('2')
                        result = 'won'
                    elif p_score == d_score:
                        amount_won = bet_amount
                        result = 'tie'
                    else:
                        result = 'lost'

                game_data = {
                    'player_hand': player_hand,
                    'dealer_hand': dealer_hand,
                    'player_score': p_score,
                    'dealer_score': d_score
                }

            # Actualizar saldo y guardar
            if result == 'lost':
                player.balance -= bet_amount
            else:
                # Si ganó (o empató), calculamos la diferencia neta
                # En 'won' amount_won ya incluye la apuesta original + ganancia? 
                # Ajuste: En lógica de casino, si apuestas 10 y ganas 20 (total), tu ganancia neta es 10.
                # Aquí asumimos que amount_won es el TOTAL que recibe el jugador.
                # Restamos la apuesta primero y luego sumamos lo ganado.
                player.balance -= bet_amount
                player.balance += amount_won
            
            player.save()

            GameSession.objects.create(
                player=player,
                game=game,
                bet_amount=bet_amount,
                amount_won=amount_won,
                result=result,
                end_time=timezone.now()
            )

            return Response({
                'result': result,
                'amount_won': float(amount_won),
                'new_balance': float(player.balance),
                'game_data': game_data,
                'message': f'¡{"Ganaste" if result == "won" else "Perdiste"}!'
            })

        except Exception as e:
            print(f"Error en juego: {e}") # Log para depuración
            return Response({'error': f'Error del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def start_blackjack(self, request, pk=None):
        """Inicia un juego de blackjack por turnos"""
        try:
            game = self.get_object()
            player = Player.objects.get(user=request.user)
            
            # Solo para juegos de blackjack
            if not ('Blackjack' in game.name or game.game_type == 'Mesa'):
                return Response({'error': 'Este juego no es Blackjack'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validar apuesta
            try:
                bet_amount = Decimal(str(request.data.get('bet_amount', 0)))
            except:
                return Response({'error': 'Monto inválido'}, status=status.HTTP_400_BAD_REQUEST)

            if bet_amount <= 0:
                return Response({'error': 'La apuesta debe ser mayor a 0'}, status=status.HTTP_400_BAD_REQUEST)

            if player.balance < bet_amount:
                return Response({'error': 'Saldo insuficiente'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Descontar apuesta inmediatamente (como en el método play)
            player.balance -= bet_amount
            player.save()
            
            # Crear manos iniciales
            player_hand = [self.get_random_card(), self.get_random_card()]
            dealer_hand = [self.get_random_card(), self.get_random_card()]
            
            # Calcular puntajes
            player_score = self.calculate_score(player_hand)
            dealer_score = self.calculate_score([dealer_hand[0]])  # Solo muestra la primera carta
            
            # Generar ID único para el juego
            game_uuid = str(uuid.uuid4())
            
            # Guardar estado en cache (Django cache)
            game_state = {
                'player_hand': player_hand,
                'dealer_hand': dealer_hand,
                'player_score': player_score,
                'dealer_score': dealer_score,
                'bet_amount': float(bet_amount),
                'player_id': player.id,
                'game_id': game.id,
                'game_state': 'player_turn'
            }
            
            # Guardar en cache por 30 minutos (1800 segundos)
            cache.set(f'blackjack_{game_uuid}', game_state, 1800)
            
            return Response({
                'game_id': game_uuid,
                'game_data': {
                    'player_hand': player_hand,
                    'dealer_hand': [dealer_hand[0], {'suit': 'HIDDEN', 'rank': 'HIDDEN'}],
                    'player_score': player_score,
                    'dealer_score': dealer_score
                },
                'message': 'Juego iniciado. Es tu turno.'
            })
            
        except Exception as e:
            print(f"Error starting blackjack: {e}")
            return Response({'error': f'Error del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def hit_blackjack(self, request, pk=None):
        """Jugador pide una carta"""
        try:
            game_uuid = request.data.get('game_id')
            if not game_uuid:
                return Response({'error': 'ID de juego requerido'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtener estado del juego desde cache
            game_state = cache.get(f'blackjack_{game_uuid}')
            if not game_state:
                return Response({'error': 'No hay juego activo o el juego ha expirado'}, status=status.HTTP_400_BAD_REQUEST)
            
            player = Player.objects.get(user=request.user)
            
            # Verificar que el jugador sea el dueño del juego
            if game_state['player_id'] != player.id:
                return Response({'error': 'Este juego no pertenece al jugador'}, status=status.HTTP_403_FORBIDDEN)
            
            # Añadir carta al jugador
            new_card = self.get_random_card()
            game_state['player_hand'].append(new_card)
            game_state['player_score'] = self.calculate_score(game_state['player_hand'])
            
            # Verificar si se pasó de 21
            busted = game_state['player_score'] > 21
            
            if busted:
                game_state['game_state'] = 'ended'
                
                # Guardar sesión de juego perdida
                GameSession.objects.create(
                    player=player,
                    game=Game.objects.get(id=game_state['game_id']),
                    bet_amount=Decimal(str(game_state['bet_amount'])),
                    amount_won=Decimal('0'),
                    result='lost',
                    end_time=timezone.now()
                )
                
                # Eliminar de cache
                cache.delete(f'blackjack_{game_uuid}')
                
                return Response({
                    'game_data': {
                        'player_hand': game_state['player_hand'],
                        'dealer_hand': game_state['dealer_hand'],
                        'player_score': game_state['player_score'],
                        'dealer_score': game_state['dealer_score']
                    },
                    'busted': True,
                    'result': 'lost',
                    'amount_won': 0,
                    'new_balance': float(player.balance)
                })
            
            # Actualizar en cache
            cache.set(f'blackjack_{game_uuid}', game_state, 1800)
            
            return Response({
                'game_data': {
                    'player_hand': game_state['player_hand'],
                    'dealer_hand': game_state['dealer_hand'],
                    'player_score': game_state['player_score'],
                    'dealer_score': game_state['dealer_score']
                },
                'busted': False
            })
            
        except Exception as e:
            print(f"Error in hit: {e}")
            return Response({'error': f'Error del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    @transaction.atomic
    def stand_blackjack(self, request, pk=None):
        """Jugador se planta, dealer juega"""
        try:
            game_uuid = request.data.get('game_id')
            if not game_uuid:
                return Response({'error': 'ID de juego requerido'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Obtener estado del juego desde cache
            game_state = cache.get(f'blackjack_{game_uuid}')
            if not game_state:
                return Response({'error': 'No hay juego activo o el juego ha expirado'}, status=status.HTTP_400_BAD_REQUEST)
            
            player = Player.objects.get(user=request.user)
            game = Game.objects.get(id=game_state['game_id'])
            
            # Verificar que el jugador sea el dueño del juego
            if game_state['player_id'] != player.id:
                return Response({'error': 'Este juego no pertenece al jugador'}, status=status.HTTP_403_FORBIDDEN)
            
            # El dealer juega (pide hasta 17)
            dealer_hand = game_state['dealer_hand']
            while self.calculate_score(dealer_hand) < 17:
                dealer_hand.append(self.get_random_card())
            
            game_state['dealer_hand'] = dealer_hand
            game_state['dealer_score'] = self.calculate_score(dealer_hand)
            game_state['player_score'] = self.calculate_score(game_state['player_hand'])
            
            # Determinar resultado
            bet_amount = Decimal(str(game_state['bet_amount']))
            player_score = game_state['player_score']
            dealer_score = game_state['dealer_score']
            
            amount_won = Decimal('0')
            result = 'lost'
            
            if player_score > 21:
                result = 'lost'
            elif dealer_score > 21:
                result = 'won'
                amount_won = bet_amount * Decimal('2')
            elif player_score > dealer_score:
                result = 'won'
                amount_won = bet_amount * Decimal('2')
            elif player_score == dealer_score:
                result = 'tie'
                amount_won = bet_amount
            else:
                result = 'lost'
            
            # Actualizar balance (la apuesta ya fue descontada en start)
            if result == 'won':
                player.balance += amount_won  # amount_won ya incluye la apuesta + ganancia
            elif result == 'tie':
                player.balance += bet_amount  # Devuelve la apuesta
            
            player.save()
            
            # Guardar sesión de juego
            GameSession.objects.create(
                player=player,
                game=game,
                bet_amount=bet_amount,
                amount_won=amount_won if result != 'tie' else bet_amount,
                result=result,
                end_time=timezone.now()
            )
            
            # Eliminar de cache
            cache.delete(f'blackjack_{game_uuid}')
            
            return Response({
                'game_data': {
                    'player_hand': game_state['player_hand'],
                    'dealer_hand': game_state['dealer_hand'],
                    'player_score': game_state['player_score'],
                    'dealer_score': game_state['dealer_score']
                },
                'result': result,
                'amount_won': float(amount_won),
                'new_balance': float(player.balance)
            })
            
        except Exception as e:
            print(f"Error in stand: {e}")
            return Response({'error': f'Error del servidor: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Métodos auxiliares para blackjack
    def get_random_card(self):
        """Genera una carta aleatoria"""
        return {'rank': random.choice(RANKS), 'suit': random.choice(SUITS)}

    def calculate_score(self, hand):
        """Calcula el puntaje de una mano de blackjack"""
        score = 0
        aces = 0
        for card in hand:
            rank = card['rank']
            if rank in ['J', 'Q', 'K']:
                score += 10
            elif rank == 'A':
                aces += 1
                score += 11
            else:
                score += int(rank)
        while score > 21 and aces > 0:
            score -= 10
            aces -= 1
        return score

class GameSessionViewSet(viewsets.ModelViewSet):
    queryset = GameSession.objects.all()
    serializer_class = GameSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        game_id = request.data.get('game')
        if not game_id:
            return Response({'error': 'El campo "game" es requerido'}, status=status.HTTP_400_BAD_REQUEST)
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
        player = Player.objects.get(user=self.request.user)
        serializer.save(player=player)

class GameListView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def player_game_history(request):
    """Obtiene el historial de juegos del jugador autenticado"""
    try:
        player = Player.objects.get(user=request.user)
        sessions = GameSession.objects.filter(player=player).order_by('-start_time')[:50]
        
        data = []
        for session in sessions:
            data.append({
                'game_name': session.game.name,
                'bet_amount': float(session.bet_amount),
                'amount_won': float(session.amount_won),
                'result': session.result,
                'start_time': session.start_time,
                'end_time': session.end_time,
                'duration': (session.end_time - session.start_time).total_seconds() if session.end_time else None
            })
        
        return Response({'history': data})
    except Player.DoesNotExist:
        return Response({'error': 'Jugador no encontrado'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def end_game_session(request, session_id):
    """Finaliza una sesión de juego específica"""
    try:
        session = GameSession.objects.get(id=session_id, player__user=request.user)
        
        if session.end_time:
            return Response({'error': 'La sesión ya ha finalizado'}, status=status.HTTP_400_BAD_REQUEST)
        
        session.end_time = timezone.now()
        session.save()
        
        return Response({
            'message': 'Sesión finalizada correctamente',
            'session_id': session.id,
            'end_time': session.end_time
        })
    except GameSession.DoesNotExist:
        return Response({'error': 'Sesión no encontrada'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)