# backend/apps/memberships/urls.py - CORREGIDO
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'plans', views.MembershipPlanViewSet, basename='membership-plan')
router.register(r'player-memberships', views.PlayerMembershipViewSet, basename='player-membership')
router.register(r'history', views.MembershipHistoryViewSet, basename='membership-history')

urlpatterns = [
    path('', include(router.urls)),
]