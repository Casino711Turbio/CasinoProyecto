from rest_framework import serializers
from .models import Transaction, TransactionLimit, CancellationRequest
from backend.apps.players.models import Player
from decimal import Decimal

class TransactionSerializer(serializers.ModelSerializer):
    player_username = serializers.CharField(source='player.user.username', read_only=True)
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'player', 'player_username', 'transaction_type', 'amount', 'currency',
            'status', 'origin', 'channel', 'created_at', 'processed_at', 'processed_by',
            'processed_by_username', 'requires_authorization', 'authorized_by'
        ]
        read_only_fields = ['id', 'created_at', 'processed_at']

class DepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'currency', 'origin', 'channel']
    
    def validate_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        return value

class WithdrawalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['amount', 'currency', 'origin', 'channel']
    
    def validate_amount(self, value):
        if value <= Decimal('0'):
            raise serializers.ValidationError("El monto debe ser mayor a 0")
        return value

class CancellationRequestSerializer(serializers.ModelSerializer):
    transaction_details = TransactionSerializer(source='transaction', read_only=True)
    requested_by_username = serializers.CharField(source='requested_by.username', read_only=True)
    
    class Meta:
        model = CancellationRequest
        fields = [
            'id', 'transaction', 'transaction_details', 'requested_by', 'requested_by_username',
            'reason', 'requires_double_authorization', 'first_authorizer', 'second_authorizer',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']