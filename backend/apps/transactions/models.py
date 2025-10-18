# backend/apps/transactions/models.py
from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal
from backend.apps.players.models import Player  # ✅ Correcto

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('deposit', 'Depósito'),
        ('withdrawal', 'Retiro'),
        ('win', 'Ganancia'),
        ('loss', 'Pérdida'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('completed', 'Completada'),
        ('cancelled', 'Cancelada'),
        ('rejected', 'Rechazada'),
    ]
    
    CURRENCY_CHOICES = [
        ('USD', 'Dólares USD'),
        ('EUR', 'Euros EUR'),
        ('MXN', 'Pesos MXN'),
    ]
    
    CHANNEL_CHOICES = [
        ('web', 'Web'),
        ('mobile', 'Móvil'),
        ('terminal', 'Terminal'),
        ('api', 'API'),
    ]

    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='USD')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Información de origen/canal
    origin = models.CharField(max_length=100, help_text="Origen de los fondos")
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    processed_at = models.DateTimeField(null=True, blank=True)
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_transactions')
    
    # Validaciones y límites
    requires_authorization = models.BooleanField(default=False)
    authorized_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='authorized_transactions')
    authorization_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['player', 'created_at']),
            models.Index(fields=['transaction_type', 'status']),
        ]

    def __str__(self):
        return f"{self.player.user.username} - {self.transaction_type} - ${self.amount}"

class TransactionLimit(models.Model):
    PERIOD_CHOICES = [
        ('daily', 'Diario'),
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
    ]
    
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='transaction_limits')
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES)
    transaction_type = models.CharField(max_length=20, choices=Transaction.TRANSACTION_TYPES)
    max_amount = models.DecimalField(max_digits=15, decimal_places=2)
    current_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    
    class Meta:
        unique_together = ['player', 'period', 'transaction_type']

class CancellationRequest(models.Model):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, related_name='cancellation_request')
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_cancellations')
    reason = models.TextField()
    requires_double_authorization = models.BooleanField(default=False)
    first_authorizer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='first_authorized_cancellations')
    second_authorizer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='second_authorized_cancellations')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pendiente'),
        ('approved', 'Aprobada'),
        ('rejected', 'Rechazada'),
    ], default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Cancellation for {self.transaction}"