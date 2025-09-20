from django.db import models
from players.models import Player

class Game(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    game_type = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class GameSession(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    result = models.CharField(max_length=100, null=True, blank=True)
    bet_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    amount_won = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.player} - {self.game} ({self.start_time})"