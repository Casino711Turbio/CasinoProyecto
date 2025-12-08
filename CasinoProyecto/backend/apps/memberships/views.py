# backend/apps/memberships/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import timedelta
from .models import MembershipPlan, Membership, MembershipHistory
from .serializers import *
from backend.apps.games.models import GameSession
from backend.apps.transactions.models import Transaction
from backend.apps.memberships.models import Membership

class MembershipPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MembershipPlan.objects.filter(is_active=True)
    serializer_class = MembershipPlanSerializer
    permission_classes = [IsAuthenticated]

class PlayerMembershipViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PlayerMembershipSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Membership.objects.all()
        return Membership.objects.filter(player=user.player)
    
    @action(detail=False, methods=['get'])
    def my_membership(self, request):
        """Obtener la membresía del jugador actual"""
        try:
            membership = Membership.objects.get(player=request.user.player)
            serializer = self.get_serializer(membership)
            return Response(serializer.data)
        except Membership.DoesNotExist:
            return Response(
                {'error': 'No tienes una membresía activa'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Estadísticas del jugador para segmentación"""
        player = request.user.player
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        # Estadísticas de juego
        game_sessions = GameSession.objects.filter(
            player=player, 
            start_time__gte=thirty_days_ago
        )
        total_games = game_sessions.count()
        total_wagered = sum(session.bet_amount for session in game_sessions)
        total_won = sum(session.amount_won for session in game_sessions)
        
        # Estadísticas de transacciones
        deposits = Transaction.objects.filter(
            player=player,
            transaction_type='deposit',
            status='completed',
            created_at__gte=thirty_days_ago
        )
        total_deposits = sum(deposit.amount for deposit in deposits)
        
        return Response({
            'last_30_days': {
                'total_games': total_games,
                'total_wagered': float(total_wagered),
                'total_won': float(total_won),
                'total_deposits': float(total_deposits),
                'net_profit': float(total_won - total_wagered)
            }
        })

class MembershipHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = MembershipHistorySerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return MembershipHistory.objects.all()
        return MembershipHistory.objects.filter(player=user.player)