from django.core.management.base import BaseCommand
from backend.apps.players.models import Player
from backend.apps.players.serializers import PlayerSerializer

class Command(BaseCommand):
    help = 'Regenera los códigos QR para todos los jugadores'

    def handle(self, *args, **options):
        players = Player.objects.all()
        serializer = PlayerSerializer()
        
        for player in players:
            self.stdout.write(f'Regenerando QR para {player.name} {player.last_name}...')
            serializer.generate_qr_code(player)
        
        self.stdout.write(
            self.style.SUCCESS(f'Se regeneraron {players.count()} códigos QR exitosamente')
        )