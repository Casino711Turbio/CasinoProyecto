from django.contrib import admin
from .models import Transaction, TransactionLimit, CancellationRequest

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('player', 'transaction_type', 'amount', 'currency', 'status', 'created_at')
    list_filter = ('transaction_type', 'status', 'currency', 'created_at')
    # Buscamos por usuario o por el origen (ej. número de cuenta)
    search_fields = ('player__user__username', 'origin')

@admin.register(TransactionLimit)
class TransactionLimitAdmin(admin.ModelAdmin):
    list_display = ('player', 'period', 'transaction_type', 'max_amount', 'current_amount')
    list_filter = ('period', 'transaction_type')

@admin.register(CancellationRequest)
class CancellationRequestAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'requested_by', 'status', 'created_at')
    list_filter = ('status',)