from django.contrib import admin
from .models import Player

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    # 'user', 'balance' existen. 'join_date' es tu fecha de creación.
    list_display = ('user', 'name', 'last_name', 'balance', 'join_date')
    
    # Buscador por usuario y nombre real
    search_fields = ('user__username', 'user__email', 'name', 'last_name')
    
    # Filtro por fecha de ingreso
    list_filter = ('join_date',)
    
    # Ordenar por fecha reciente
    ordering = ('-join_date',)