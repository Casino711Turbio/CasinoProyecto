from rest_framework import viewsets, status,permissions

from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Player
from .serializers import PlayerSerializer
import qrcode
from io import BytesIO
from django.core.files import File
from django.conf import settings
import os
from django.shortcuts import get_object_or_404
import base64
from django.http import JsonResponse
from rest_framework import generics
from rest_framework import permissions
from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response



class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

    @action(detail=True, methods=['post'])
    def add_balance(self, request, pk=None):
        player = self.get_object()
        amount = request.data.get('amount')
        if amount is None or float(amount) <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        player.balance += float(amount)
        player.save()
        return Response({'new_balance': player.balance})

    @action(detail=True, methods=['post'])
    def withdraw_balance(self, request, pk=None):
        player = self.get_object()
        amount = request.data.get('amount')
        if amount is None or float(amount) <= 0:
            return Response({'error': 'Invalid amount'}, status=status.HTTP_400_BAD_REQUEST)
        if player.balance < float(amount):
            return Response({'error': 'Insufficient balance'}, status=status.HTTP_400_BAD_REQUEST)
        player.balance -= float(amount)
        player.save()
        return Response({'new_balance': player.balance})

    @action(detail=True, methods=['get'])
    def get_balance(self, request, pk=None):
        player = self.get_object()
        return Response({'balance': player.balance})
    
    @action(detail=True, methods=['get'])
    def qr_code(self, request, pk=None):
        player = get_object_or_404(Player, pk=pk)
        if player.qr_code:
            return Response({'qr_code_url': player.qr_code.url})
        return Response({'error': 'QR code not found'}, status=404)

class PlayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def scan_qr(request):
    """
    Endpoint para escanear códigos QR de jugadores
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
    Endpoint para actualizar el saldo de un jugador
    """
    try:
        player = get_object_or_404(Player, id=player_id)
        amount = float(request.data.get('amount', 0))
        action = request.data.get('action', 'add')  # 'add' o 'subtract'
        
        if action == 'add':
            player.balance += amount
        elif action == 'subtract':
            if player.balance >= amount:
                player.balance -= amount
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
        return Response(serializer.data)
    
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
class PlayerListCreateView(generics.ListCreateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]