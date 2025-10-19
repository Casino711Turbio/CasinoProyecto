# backend/apps/memberships/management/commands/load_memberships.py
from django.core.management.base import BaseCommand
from backend.apps.memberships.models import MembershipPlan
from django.utils import timezone # <-- Import timezone
from datetime import timedelta

class Command(BaseCommand):
    help = 'Carga membresías predeterminadas en la base de datos'

    def handle(self, *args, **options):
        now = timezone.now() # <-- Use timezone.now()
        # Lista de membresías predeterminadas
        default_memberships = [
            {
                'name': 'Free',
                'tier': 'bronze',
                'description': 'Membresía gratuita básica',
                'benefits': {"games": "basic", "bets": "low"},
                'valid_from': now,
                'valid_until': now + timedelta(days=3650)
            },
            {
                'name': 'Silver',
                'tier': 'silver',
                'description': 'Membresía de nivel intermedio',
                'benefits': {"games": "intermediate", "bets": "medium", "bonuses": "occasional"},
                'valid_from': now,
                'valid_until': now + timedelta(days=3650)
            },
            {
                'name': 'Gold',
                'tier': 'gold',
                'description': 'Membresía premium',
                'benefits': {"games": "all", "bets": "high", "bonuses": "regular", "support": "priority"},
                'valid_from': now,
                'valid_until': now + timedelta(days=3650)
            },
            {
                'name': 'Platinum',
                'tier': 'platinum',
                'description': 'Membresía exclusiva',
                'benefits': {"games": "vip", "bets": "unlimited", "bonuses": "exclusive", "manager": "personal", "events": "special"},
                'valid_from': now,
                'valid_until': now + timedelta(days=3650)
            }
        ]

        # Crear las membresías en la base de datos
        for membership_data in default_memberships:
            # CORREGIDO: Usar 'tier' para la búsqueda en get_or_create
            plan, created = MembershipPlan.objects.get_or_create(
                tier=membership_data['tier'],
                defaults=membership_data
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Plan de membresía creado: {plan.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'El plan de membresía ya existe: {plan.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS('¡Carga de planes de membresía completada!')
        )