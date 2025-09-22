from django.core.management.base import BaseCommand
from memberships.models import Membership

class Command(BaseCommand):
    help = 'Carga membresías predeterminadas en la base de datos'

    def handle(self, *args, **options):
        # Lista de membresías predeterminadas
        default_memberships = [
            {
                'name': 'Free',
                'description': 'Membresía gratuita básica',
                'benefits': 'Acceso a juegos básicos, límite de apuestas bajo'
            },
            {
                'name': 'Silver',
                'description': 'Membresía de nivel intermedio',
                'benefits': 'Acceso a más juegos, límites de apuestas más altos, bonificaciones ocasionales'
            },
            {
                'name': 'Gold',
                'description': 'Membresía premium',
                'benefits': 'Acceso a todos los juegos, límites de apuestas altos, bonificaciones regulares, soporte prioritario'
            },
            {
                'name': 'Platinum',
                'description': 'Membresía exclusiva',
                'benefits': 'Acceso VIP a todos los juegos, límites de apuestas ilimitados, bonificaciones exclusivas, manager personal, eventos especiales'
            }
        ]

        # Crear las membresías en la base de datos
        for membership_data in default_memberships:
            membership, created = Membership.objects.get_or_create(
                name=membership_data['name'],
                defaults=membership_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Membresía creada: {membership.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'La membresía ya existe: {membership.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('¡Carga de membresías completada!')
        )