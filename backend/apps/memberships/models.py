# backend/apps/memberships/models.py
from django.db import models
from backend.apps.players.models import Player

class MembershipPlan(models.Model):
    TIER_CHOICES = [
        ('bronze', 'Bronce'),
        ('silver', 'Plata'),
        ('gold', 'Oro'),
        ('platinum', 'Platino'),
        ('vip', 'VIP'),
    ]
    
    name = models.CharField(max_length=100)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, unique=True)
    description = models.TextField()
    
    # Beneficios
    benefits = models.JSONField(default=dict, help_text="Beneficios en formato JSON")
    
    # Restricciones
    min_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    min_monthly_volume = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Vigencia
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Metadatos
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-min_balance']
    
    def __str__(self):
        return f"{self.tier.upper()} - {self.name}"

class Membership(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='player_membership')
    plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE)
    
    # Estado de la membresía
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    # Estadísticas del jugador en esta membresía
    total_wagered = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_won = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_deposits = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    class Meta:
        ordering = ['-joined_at']
    
    def __str__(self):
        return f"{self.player.user.username} - {self.plan.tier}"

class MembershipHistory(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='membership_history')
    from_plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE, related_name='+', null=True, blank=True)
    to_plan = models.ForeignKey(MembershipPlan, on_delete=models.CASCADE, related_name='+')
    changed_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-changed_at']
    
    def __str__(self):
        return f"{self.player.user.username} changed to {self.to_plan.tier}"