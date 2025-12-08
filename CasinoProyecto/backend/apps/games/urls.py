from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'games', views.GameViewSet)
router.register(r'game-sessions', views.GameSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('list/', views.GameListView.as_view(), name='game-list'),
    #path('game-sessions/create/', views.GameSessionCreateView.as_view(), name='game-session-create'),
    path('game-sessions/<int:session_id>/end/', views.end_game_session, name='end-game-session'),
    path('player/history/', views.player_game_history, name='player-game-history'),
]