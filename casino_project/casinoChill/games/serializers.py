from rest_framework import serializers
from .models import Game, GameSession
from players.serializers import PlayerSerializer


class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'

class GameSessionSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    
    class Meta:
        model = GameSession
        fields = '__all__'