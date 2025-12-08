from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'players', views.PlayerViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('qr/scan/', views.scan_qr, name='scan-qr'),  # ¡IMPORTANTE! Sin "players/" antes
    path('<int:player_id>/balance/', views.update_balance, name='update-balance'),
    path('my/balance/', views.my_balance, name='my-balance'),
]