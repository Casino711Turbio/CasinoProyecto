#!/usr/bin/env python
import os
import django
import sys

# Agregar el directorio del proyecto al path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configurar el entorno Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'casinoChill.settings')
django.setup()

from django.contrib.auth.models import User
from backend.apps.players.models import Player
from backend.apps.memberships.models import MembershipPlan, Membership
from django.utils import timezone
from datetime import timedelta

def create_test_users():
    print("🎰 ===== CREANDO USUARIOS DE PRUEBA PARA CASINOCHILL =====")
    print()
    
    # 1. ADMINISTRADOR PURO (sin perfil de jugador)
    if not User.objects.filter(username='admin_puro').exists():
        admin = User.objects.create_user(
            username='admin_puro',
            email='admin@casinochill.com',
            password='admin123',
            first_name='Administrador',
            last_name='Sistema'
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print("✅ ADMINISTRADOR creado:")
        print(f"   Usuario: admin_puro")
        print(f"   Contraseña: admin123")
        print(f"   Email: admin@casinochill.com")
        print(f"   is_staff: {admin.is_staff}")
        print(f"   is_superuser: {admin.is_superuser}")
        print(f"   NOTA: Este usuario NO tiene perfil Player")
        print()
    else:
        admin = User.objects.get(username='admin_puro')
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print("⚠️  ADMINISTRADOR ya existe, actualizado a admin")
        print()
    
    # 2. JUGADOR NORMAL (con perfil de jugador)
    if not User.objects.filter(username='jugador').exists():
        user = User.objects.create_user(
            username='jugador',
            email='jugador@casinochill.com',
            password='jugador123',
            first_name='Juan',
            last_name='Pérez'
        )
        
        # Crear perfil Player
        player = Player.objects.create(
            user=user,
            name='Juan',
            last_name='Pérez',
            balance=5000.00
        )
        
        # Obtener o crear plan gratuito
        free_plan, created = MembershipPlan.objects.get_or_create(
            tier='bronze',
            defaults={
                'name': 'Plan Básico',
                'description': 'Plan gratuito para nuevos jugadores',
                'benefits': {"juegos_basicos": True},
                'min_balance': 0,
                'min_monthly_volume': 0,
                'valid_from': timezone.now(),
                'is_active': True
            }
        )
        
        # Crear membresía
        Membership.objects.create(
            player=player,
            plan=free_plan,
            expires_at=timezone.now() + timedelta(days=30),
            is_active=True
        )
        
        print("✅ JUGADOR creado:")
        print(f"   Usuario: jugador")
        print(f"   Contraseña: jugador123")
        print(f"   Email: jugador@casinochill.com")
        print(f"   Nombre: {player.name} {player.last_name}")
        print(f"   Balance inicial: ${player.balance}")
        print(f"   Plan: {free_plan.name}")
        print()
    else:
        print("⚠️  JUGADOR ya existe")
        print()
    
    # 3. SUPERUSUARIO/STAFF (sin perfil de jugador)
    if not User.objects.filter(username='supervisor').exists():
        supervisor = User.objects.create_user(
            username='supervisor',
            email='supervisor@casinochill.com',
            password='super123',
            first_name='Carlos',
            last_name='Supervisor'
        )
        supervisor.is_staff = True
        supervisor.is_superuser = False
        supervisor.save()
        print("✅ SUPERVISOR creado:")
        print(f"   Usuario: supervisor")
        print(f"   Contraseña: super123")
        print(f"   Email: supervisor@casinochill.com")
        print(f"   is_staff: {supervisor.is_staff}")
        print(f"   is_superuser: {supervisor.is_superuser}")
        print()
    else:
        print("⚠️  SUPERVISOR ya existe")
        print()
    
    # 4. Tu usuario actual (hacerlo admin)
    try:
        franko = User.objects.get(username='franko-darko')
        franko.is_staff = True
        franko.is_superuser = True
        franko.save()
        print("✅ Tu usuario 'franko-darko' actualizado a ADMINISTRADOR:")
        print(f"   is_staff: {franko.is_staff}")
        print(f"   is_superuser: {franko.is_superuser}")
        print(f"   NOTA: Este usuario seguirá sin perfil Player")
        print()
    except User.DoesNotExist:
        print("❌ Tu usuario 'franko-darko' no encontrado en la base de datos")
        print()
    
    print("🎲 ===== RESUMEN DE CREDENCIALES =====")
    print()
    print("👑 ADMINISTRADORES (acceso a /staff/players):")
    print("   • admin_puro / admin123")
    print("   • franko-darko / (tu contraseña actual)")
    print("   • supervisor / super123 (solo staff)")
    print()
    print("🎮 JUGADOR (acceso a /dashboard):")
    print("   • jugador / jugador123")
    print()
    print("🔑 IMPORTANTE:")
    print("   • Los administradores NO tienen perfil Player")
    print("   • Los jugadores SÍ tienen perfil Player")
    print("   • El login redirigirá automáticamente según el rol")
    print()
    print("🚀 Para probar:")
    print("   1. Login con 'admin_puro' → /staff/players")
    print("   2. Login con 'jugador' → /dashboard")
    print()

if __name__ == '__main__':
    create_test_users()