from rest_framework import serializers
from .models import Game, GameSession
from players.serializers import PlayerSerializer

class GameSerializer(serializers.ModelSerializer):
    # Campo calculado para mostrar estadísticas (opcional)
    is_available = serializers.BooleanField(read_only=True, default=True)
    
    class Meta:
        model = Game
        fields = '__all__'
        # O especificar campos explícitamente para mayor seguridad:
        # fields = ['id', 'name', 'description', 'rules', 'created_at', 'updated_at', 'is_available']
    
    def validate_name(self, value):
        """
        Validación personalizada para el nombre del juego
        """
        if len(value.strip()) < 2:
            raise serializers.ValidationError("El nombre del juego debe tener al menos 2 caracteres")
        return value

class GameSessionSerializer(serializers.ModelSerializer):
    player = PlayerSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    
    # Campos adicionales para facilitar el frontend (opcional)
    game_name = serializers.CharField(source='game.name', read_only=True)
    player_username = serializers.CharField(source='player.user.username', read_only=True)
    duration = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = GameSession
        fields = '__all__'
        # Campos recomendados para mayor claridad:
        # fields = [
        #     'id', 'player', 'game', 'player_username', 'game_name',
        #     'bet_amount', 'amount_won', 'result', 'start_time', 'end_time',
        #     'duration', 'created_at'
        # ]
        read_only_fields = ('start_time', 'end_time', 'created_at', 'result')
    
    def get_duration(self, obj):
        """
        Calcula la duración de la sesión de juego en segundos
        """
        if obj.start_time and obj.end_time:
            duration = obj.end_time - obj.start_time
            return duration.total_seconds()
        return None
    
    def validate_bet_amount(self, value):
        """
        Validación del monto de apuesta
        """
        if value <= 0:
            raise serializers.ValidationError("El monto de apuesta debe ser mayor a 0")
        return value
    
    def validate(self, data):
        """
        Validación a nivel de objeto
        """
        # Verificar que end_time sea posterior a start_time si ambos existen
        if data.get('end_time') and data.get('start_time'):
            if data['end_time'] < data['start_time']:
                raise serializers.ValidationError({
                    'end_time': 'La fecha de fin no puede ser anterior a la fecha de inicio'
                })
        
        return data

# Serializer alternativo para creación (si se necesita)
class GameSessionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer específico para crear sesiones de juego
    """
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), 
        source='game',
        write_only=True
    )
    
    class Meta:
        model = GameSession
        fields = ['game_id', 'bet_amount']
    
    def create(self, validated_data):
        # El player se asignará en la vista
        return super().create(validated_data)