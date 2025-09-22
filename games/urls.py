from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GameViewSet, GameSessionViewSet
from . import views

router = DefaultRouter()
router.register(r'games', GameViewSet)
router.register(r'game-sessions', GameSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('games/', views.GameListView.as_view(), name='game-list'),
    path('game-sessions/', views.GameSessionCreateView.as_view(), name='game-session-create'),
    path('game-sessions/<int:session_id>/end/', views.end_game_session, name='end-game-session'),
]