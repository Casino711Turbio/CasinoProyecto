# backend/apps/transactions/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction as db_transaction, models
from django.db.models import F
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend
from .models import Transaction, TransactionLimit, CancellationRequest
from .serializers import (
    TransactionSerializer, 
    DepositSerializer, 
    WithdrawalSerializer, 
    CancellationRequestSerializer
)
from backend.apps.players.models import Player


class TransactionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Manejar si el usuario no tiene player
        if not hasattr(user, 'player'):
            return Transaction.objects.none()
            
        if user.is_staff:
            return Transaction.objects.all().order_by('-created_at')
        return Transaction.objects.filter(player=user.player).order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create_deposit':
            return DepositSerializer
        elif self.action == 'create_withdrawal':
            return WithdrawalSerializer
        return TransactionSerializer

    @action(detail=False, methods=['post'])
    @db_transaction.atomic
    def create_deposit(self, request):
        """Crear un depósito ficticio"""
        print(f"🟢 CREATE_DEPOSIT llamado por: {request.user.username}")
        print(f"📥 Datos recibidos: {request.data}")
        
        # Verificar que el usuario tenga player
        if not hasattr(request.user, 'player'):
            return Response(
                {'error': 'Usuario no tiene perfil de jugador'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = DepositSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            print(f"✅ Serializador válido: {serializer.validated_data}")
            player = request.user.player
            
            # Convertir amount a Decimal
            amount = Decimal(str(serializer.validated_data['amount']))
            print(f"💰 Monto a depositar: {amount}")
            
            # ✅ TEMPORAL: Desactivar límites para desarrollo
            # Validar límites
            # if not self._check_limits(player, 'deposit', amount):
            #     return Response(
            #         {'error': 'Límite de depósito excedido'}, 
            #         status=status.HTTP_400_BAD_REQUEST
            #     )
            
            # Crear transacción
            transaction_data = serializer.validated_data.copy()
            transaction_data['amount'] = amount
            transaction_data['currency'] = transaction_data.get('currency', 'USD')
            
            print(f"📝 Creando transacción con datos: {transaction_data}")
            
            transaction_obj = Transaction.objects.create(
                player=player,
                transaction_type='deposit',
                **transaction_data
            )
            
            print(f"✅ Transacción creada: ID {transaction_obj.id}")
            
            # Actualizar balance del jugador de forma atómica
            Player.objects.filter(id=player.id).update(
                balance=F('balance') + amount
            )
            
            # ✅ TEMPORAL: No actualizar límites
            # Actualizar límites
            # self._update_limits(player, 'deposit', amount)
            
            # Procesar transacción
            transaction_obj.status = 'completed'
            transaction_obj.processed_at = timezone.now()
            transaction_obj.processed_by = request.user
            transaction_obj.save()
            
            # Obtener el jugador actualizado
            player.refresh_from_db()
            print(f"💰 Nuevo balance: {player.balance}")
            
            return Response({
                **TransactionSerializer(transaction_obj).data,
                'new_balance': str(player.balance),
                'message': f'Depósito de ${amount:.2f} realizado exitosamente'
            })
        else:
            print(f"❌ Errores del serializador: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    @db_transaction.atomic
    def create_withdrawal(self, request):
        """Crear un retiro ficticio"""
        print(f"🟢 CREATE_WITHDRAWAL llamado por: {request.user.username}")
        print(f"📥 Datos recibidos: {request.data}")
        
        # Verificar que el usuario tenga player
        if not hasattr(request.user, 'player'):
            return Response(
                {'error': 'Usuario no tiene perfil de jugador'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = WithdrawalSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            print(f"✅ Serializador válido: {serializer.validated_data}")
            player = request.user.player
            
            # Convertir amount a Decimal
            amount = Decimal(str(serializer.validated_data['amount']))
            print(f"💰 Monto a retirar: {amount}")
            
            # Validar saldo suficiente de forma atómica
            if not Player.objects.filter(id=player.id, balance__gte=amount).exists():
                return Response(
                    {'error': 'Saldo insuficiente'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # ✅ TEMPORAL: Desactivar límites para desarrollo
            # Validar límites
            # if not self._check_limits(player, 'withdrawal', amount):
            #     return Response(
            #         {'error': 'Límite de retiro excedido'}, 
            #         status=status.HTTP_400_BAD_REQUEST
            #     )
            
            # Crear transacción
            transaction_data = serializer.validated_data.copy()
            transaction_data['amount'] = amount
            transaction_data['currency'] = transaction_data.get('currency', 'USD')
            
            print(f"📝 Creando transacción con datos: {transaction_data}")
            
            transaction_obj = Transaction.objects.create(
                player=player,
                transaction_type='withdrawal',
                **transaction_data
            )
            
            print(f"✅ Transacción creada: ID {transaction_obj.id}")
            
            # Validar autorización si es requerida
            if amount > Decimal('1000'):
                transaction_obj.requires_authorization = True
                transaction_obj.save()
                return Response(
                    {'message': 'Retiro requiere autorización', 'transaction_id': transaction_obj.id},
                    status=status.HTTP_202_ACCEPTED
                )
            
            # Procesar retiro inmediato de forma atómica
            updated = Player.objects.filter(
                id=player.id, 
                balance__gte=amount
            ).update(
                balance=F('balance') - amount
            )
            
            if not updated:
                return Response(
                    {'error': 'Saldo insuficiente durante el procesamiento'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            transaction_obj.status = 'completed'
            transaction_obj.processed_at = timezone.now()
            transaction_obj.processed_by = request.user
            transaction_obj.save()
            
            # ✅ TEMPORAL: No actualizar límites
            # Actualizar límites
            # self._update_limits(player, 'withdrawal', amount)
            
            # Obtener el jugador actualizado
            player.refresh_from_db()
            print(f"💰 Nuevo balance: {player.balance}")
            
            return Response({
                **TransactionSerializer(transaction_obj).data,
                'new_balance': str(player.balance),
                'message': f'Retiro de ${amount:.2f} realizado exitosamente'
            })
        else:
            print(f"❌ Errores del serializador: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _check_limits(self, player, transaction_type, amount):
        """Validar límites de transacción - MODO SEGURO"""
        # ✅ TEMPORAL: Desactivar límites para desarrollo
        print(f"⚠️ LÍMITES DESACTIVADOS TEMPORALMENTE para desarrollo")
        return True
        
        # Código original (comentado):
        """
        today = timezone.now().date()
        
        try:
            # Obtener o crear límite diario
            daily_limit, created = TransactionLimit.objects.get_or_create(
                player=player,
                period='daily',
                transaction_type=transaction_type,
                defaults={
                    'max_amount': Decimal('999999'),  # Límite alto para desarrollo
                    'current_amount': Decimal('0'),
                    'period_start': today,
                    'period_end': today + timedelta(days=1)
                }
            )
            
            # Verificar si el período ha expirado y resetear si es necesario
            if not created and daily_limit.period_end < today:
                daily_limit.current_amount = Decimal('0')
                daily_limit.period_start = today
                daily_limit.period_end = today + timedelta(days=1)
                daily_limit.save()
            
            print(f"📊 Límite diario: {daily_limit.current_amount}/{daily_limit.max_amount}")
            
            if daily_limit.current_amount + amount > daily_limit.max_amount:
                return False
            
            # Obtener o crear límite mensual
            month_start = today.replace(day=1)
            next_month = month_start + timedelta(days=32)
            month_end = next_month.replace(day=1) - timedelta(days=1)
            
            monthly_limit, created = TransactionLimit.objects.get_or_create(
                player=player,
                period='monthly',
                transaction_type=transaction_type,
                defaults={
                    'max_amount': Decimal('9999999'),  # Límite alto para desarrollo
                    'current_amount': Decimal('0'),
                    'period_start': month_start,
                    'period_end': month_end
                }
            )
            
            # Verificar si el período mensual ha expirado
            if not created and monthly_limit.period_end < today:
                monthly_limit.current_amount = Decimal('0')
                monthly_limit.period_start = month_start
                monthly_limit.period_end = month_end
                monthly_limit.save()
            
            print(f"📊 Límite mensual: {monthly_limit.current_amount}/{monthly_limit.max_amount}")
            
            if monthly_limit.current_amount + amount > monthly_limit.max_amount:
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Error en _check_limits: {e}")
            # MODO SEGURO: En caso de error, rechazar la transacción
            return False
        """

    def _update_limits(self, player, transaction_type, amount):
        """Actualizar límites de transacción de forma atómica"""
        # ✅ TEMPORAL: No actualizar límites para desarrollo
        pass
        
        # Código original (comentado):
        """
        today = timezone.now().date()
        
        try:
            # Actualizar límite diario de forma atómica
            daily_limit = TransactionLimit.objects.filter(
                player=player,
                period='daily',
                transaction_type=transaction_type,
                period_start__lte=today,
                period_end__gte=today
            )
            
            if daily_limit.exists():
                daily_limit.update(current_amount=F('current_amount') + amount)
            
            # Actualizar límite mensual de forma atómica
            month_start = today.replace(day=1)
            monthly_limit = TransactionLimit.objects.filter(
                player=player,
                period='monthly',
                transaction_type=transaction_type,
                period_start=month_start
            )
            
            if monthly_limit.exists():
                monthly_limit.update(current_amount=F('current_amount') + amount)
            
        except Exception as e:
            # Log the error but don't fail the transaction
            print(f"⚠️ Error en _update_limits: {e}")
        """


class CancellationRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CancellationRequestSerializer
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return CancellationRequest.objects.all().order_by('-created_at')
        return CancellationRequest.objects.filter(requested_by=user).order_by('-created_at')
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    @db_transaction.atomic
    def authorize(self, request, pk=None):
        """Autorizar una cancelación"""
        cancellation = self.get_object()
        user = request.user
        
        if cancellation.requires_double_authorization:
            if not cancellation.first_authorizer:
                cancellation.first_authorizer = user
                cancellation.save()
                return Response({'message': 'Primera autorización registrada'})
            elif not cancellation.second_authorizer and cancellation.first_authorizer != user:
                cancellation.second_authorizer = user
                cancellation.status = 'approved'
                cancellation.save()
                
                # Cancelar la transacción de forma atómica
                with db_transaction.atomic():
                    trans = cancellation.transaction
                    player = trans.player
                    
                    if trans.transaction_type == 'deposit':
                        # Revertir depósito: restar del balance
                        Player.objects.filter(id=player.id).update(
                            balance=F('balance') - trans.amount
                        )
                    elif trans.transaction_type == 'withdrawal':
                        # Revertir retiro: sumar al balance
                        Player.objects.filter(id=player.id).update(
                            balance=F('balance') + trans.amount
                        )
                    
                    trans.status = 'cancelled'
                    trans.save()
                
                return Response({'message': 'Cancelación autorizada y procesada'})
        else:
            cancellation.first_authorizer = user
            cancellation.status = 'approved'
            cancellation.save()
            
            # Cancelar la transacción de forma atómica
            with db_transaction.atomic():
                trans = cancellation.transaction
                player = trans.player
                
                if trans.transaction_type == 'deposit':
                    Player.objects.filter(id=player.id).update(
                        balance=F('balance') - trans.amount
                    )
                elif trans.transaction_type == 'withdrawal':
                    Player.objects.filter(id=player.id).update(
                        balance=F('balance') + trans.amount
                    )
                
                trans.status = 'cancelled'
                trans.save()
            
            return Response({'message': 'Cancelación autorizada y procesada'})
        
        return Response({'error': 'No se puede autorizar'}, status=status.HTTP_400_BAD_REQUEST)


class TransactionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['transaction_type', 'status', 'currency', 'channel']
    search_fields = ['origin', 'authorization_notes']
    ordering_fields = ['created_at', 'amount']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        # Manejar si el usuario no tiene player
        if not hasattr(user, 'player'):
            return Transaction.objects.none()
            
        queryset = Transaction.objects.filter(player=user.player)
        
        # Filtros adicionales por fecha
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
            
        return queryset
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Resumen de transacciones por período"""
        # Manejar si el usuario no tiene player
        if not hasattr(request.user, 'player'):
            return Response({
                'period': {'start_date': None, 'end_date': None},
                'summary': {
                    'total_deposits': "0",
                    'total_withdrawals': "0",
                    'total_wins': "0",
                    'total_losses': "0",
                    'transaction_count': 0
                }
            })
            
        player = request.user.player
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = Transaction.objects.filter(player=player)
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        deposits = queryset.filter(transaction_type='deposit', status='completed')
        withdrawals = queryset.filter(transaction_type='withdrawal', status='completed')
        wins = queryset.filter(transaction_type='win', status='completed')
        losses = queryset.filter(transaction_type='loss', status='completed')
        
        return Response({
            'period': {
                'start_date': start_date,
                'end_date': end_date
            },
            'summary': {
                'total_deposits': str(sum(d.amount for d in deposits)),
                'total_withdrawals': str(sum(w.amount for w in withdrawals)),
                'total_wins': str(sum(win.amount for win in wins)),
                'total_losses': str(sum(loss.amount for loss in losses)),
                'transaction_count': queryset.count()
            }
        })