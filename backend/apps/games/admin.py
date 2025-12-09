from django.contrib import admin
from .models import Game, GameSession

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    # Tus campos reales son name y game_type
    list_display = ('name', 'game_type')
    list_filter = ('game_type',)
    search_fields = ('name', 'description')

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('player', 'game', 'bet_amount', 'amount_won', 'start_time')
    list_filter = ('start_time',)