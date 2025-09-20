from django.db import migrations

def create_initial_games(apps, schema_editor):
    Game = apps.get_model('games', 'Game')
    
    Game.objects.create(
        name='Tragamonedas Clásico',
        description='Máquina tragamonedas con frutas y símbolos clásicos',
        game_type='SLOT'
    )
    
    Game.objects.create(
        name='Ruleta Europea',
        description='Ruleta con un solo cero, mejores probabilidades',
        game_type='ROULETTE'
    )
    
    Game.objects.create(
        name='Blackjack',
        description='Juego de cartas contra el crupier, objetivo llegar a 21',
        game_type='CARD'
    )
    
    Game.objects.create(
        name='Póker Texas Holdem',
        description='Variante de póker contra otros jugadores',
        game_type='CARD'
    )
    
    Game.objects.create(
        name='Baccarat',
        description='Juego de cartas simple, apuesta a jugador o banco',
        game_type='CARD'
    )

class Migration(migrations.Migration):
    dependencies = [
        ('games', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_games),
    ]