# backend/apps/memberships/serializers.py
from rest_framework import serializers
from .models import MembershipPlan, Membership, MembershipHistory
class MembershipPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = MembershipPlan
        fields = [
            'id', 'name', 'tier', 'description', 'benefits', 
            'min_balance', 'min_monthly_volume', 'valid_from', 
            'valid_until', 'is_active'
        ]

class PlayerMembershipSerializer(serializers.ModelSerializer):
    plan_details = MembershipPlanSerializer(source='plan', read_only=True)
    player_username = serializers.CharField(source='player.user.username', read_only=True)
    
    class Meta:
        model = Membership
        fields = [
            'id', 'player', 'player_username', 'plan', 'plan_details',
            'is_active', 'joined_at', 'expires_at', 'total_wagered',
            'total_won', 'total_deposits'
        ]
        read_only_fields = ['id', 'joined_at', 'total_wagered', 'total_won', 'total_deposits']

class MembershipHistorySerializer(serializers.ModelSerializer):
    from_plan_tier = serializers.CharField(source='from_plan.tier', read_only=True, allow_null=True)
    to_plan_tier = serializers.CharField(source='to_plan.tier', read_only=True)
    player_username = serializers.CharField(source='player.user.username', read_only=True)
    
    class Meta:
        model = MembershipHistory
        fields = [
            'id', 'player', 'player_username', 'from_plan', 'from_plan_tier',
            'to_plan', 'to_plan_tier', 'changed_at', 'reason'
        ]
        read_only_fields = ['id', 'changed_at']