from django.db import migrations

def create_initial_memberships(apps, schema_editor):
    Membership = apps.get_model('memberships', 'Membership')
    
    Membership.objects.create(
        name='Free',
        description='Membresía básica gratuita',
        benefits='Acceso a juegos básicos, promociones limitadas'
    )
    
    Membership.objects.create(
        name='Silver',
        description='Membresía intermedia',
        benefits='Acceso a más juegos, mejores promociones, soporte prioritario'
    )
    
    Membership.objects.create(
        name='Gold',
        description='Membresía premium',
        benefits='Acceso a todos los juegos, promociones exclusivas, soporte 24/7'
    )
    
    Membership.objects.create(
        name='Platinum',
        description='Membresía VIP',
        benefits='Todos los beneficios Gold + eventos exclusivos, bonos especiales'
    )

class Migration(migrations.Migration):
    dependencies = [
        ('memberships', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_memberships),
    ]