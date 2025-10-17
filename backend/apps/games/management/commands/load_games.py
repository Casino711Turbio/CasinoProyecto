from django.core.management.base import BaseCommand
from backend.apps.games.models import Game

class Command(BaseCommand):
    help = 'Carga juegos predeterminados en la base de datos'

    def handle(self, *args, **options):
        # Lista de juegos predeterminados
        default_games = [
            {
                'name': 'Ruleta Europea',
                'description': 'Ruleta clásica con un solo cero',
                'game_type': 'Mesa'
            },
            {
                'name': 'Tragamonedas Clásicas',
                'description': 'Máquina tragamonedas con frutas y símbolos clásicos',
                'game_type': 'Máquina'
            },
            {
                'name': 'Blackjack',
                'description': 'Juego de cartas contra el crupier, objetivo llegar a 21',
                'game_type': 'Mesa'
            },
            {
                'name': 'Póker Texas Hold\'em',
                'description': 'Variante de póker donde cada jugador recibe dos cartas y comparte cinco comunitarias',
                'game_type': 'Mesa'
            },
            {
                'name': 'Baccarat',
                'description': 'Juego de cartas donde se apuesta por la mano del jugador, la del banquero o un empate',
                'game_type': 'Mesa'
            },
            {
                'name': 'Dados (Craps)',
                'description': 'Juego de dados donde se apuesta por el resultado de los lanzamientos',
                'game_type': 'Mesa'
            },
            {
                'name': 'Ruleta Americana',
                'description': 'Ruleta con doble cero (0 y 00)',
                'game_type': 'Mesa'
            },
            {
                'name': 'Video Póker',
                'description': 'Máquina de video póker con distintas variantes',
                'game_type': 'Máquina'
            },
            {
                'name': 'Pai Gow Poker',
                'description': 'Variante de póker que combina elementos del juego chino Pai Gow',
                'game_type': 'Mesa'
            },
            {
                'name': 'Tragamonedas Progresivas',
                'description': 'Máquinas tragamonedas con jackpots acumulativos que aumentan con cada apuesta',
                'game_type': 'Máquina'
            }
        ]

        # Crear los juegos en la base de datos
        for game_data in default_games:
            game, created = Game.objects.get_or_create(
                name=game_data['name'],
                defaults=game_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Juego creado: {game.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'El juego ya existe: {game.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('¡Carga de juegos completada!')
        )