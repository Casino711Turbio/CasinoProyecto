from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlayerViewSet
from . import views

router = DefaultRouter()
router.register(r'players', PlayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('players/', views.PlayerListCreateView.as_view(), name='player-list-create'),
    path('players/<int:pk>/', views.PlayerDetailView.as_view(), name='player-detail'),
    path('players/', views.PlayerListCreateView.as_view(), name='player-list-create'),
    path('players/<int:pk>/', views.PlayerDetailView.as_view(), name='player-detail'),
    path('players/<int:player_id>/balance/', views.update_balance, name='update-balance'),
    path('qr/scan/', views.scan_qr, name='scan-qr'),
]
