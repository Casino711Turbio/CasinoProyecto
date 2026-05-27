from django.contrib import admin
from .models import Membership, MembershipPlan

@admin.register(MembershipPlan)
class MembershipPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'tier', 'min_balance', 'is_active')
    list_filter = ('tier', 'is_active')
    search_fields = ('name',)

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    # Campos que sí existen en tu modelo Membership
    list_display = ('player', 'plan', 'is_active', 'expires_at', 'total_wagered')
    list_filter = ('is_active', 'plan', 'joined_at')
    search_fields = ('player__user__username', 'plan__name')