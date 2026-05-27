from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router para el ViewSet de jugadores
router = DefaultRouter()
router.register(r'players', views.PlayerViewSet, basename='player')

urlpatterns = [
    # URLs del ViewSet (players/...)
    path('', include(router.urls)),
    
    # ============ ENDPOINTS DIRECTOS PARA REACT ============
    # Balance del jugador actual - versión mejorada
    path('my/balance/', views.get_my_balance, name='get-my-balance'),
    
    # Perfil completo del jugador
    path('my/profile/', views.get_my_profile, name='get-my-profile'),
    
    # ============ ENDPOINTS POR COMPATIBILIDAD ============
    # Balance (mantenido para compatibilidad con código existente)
    path('my/', views.my_balance, name='my-balance'),
    
    # ============ ENDPOINTS PARA ESCANEO QR ============
    # QR - versión actual
    path('qr/scan/', views.scan_qr, name='scan-qr'),
    # QR - alias alternativo (para compatibilidad)
    path('scan-qr/', views.scan_qr, name='scan-qr-alt'),
    
    # ============ ENDPOINTS PARA ACTUALIZAR BALANCE ============
    # Actualizar balance - versión actual
    path('<int:player_id>/balance/', views.update_balance, name='update-balance'),
    # Actualizar balance - alias alternativo (para compatibilidad)
    path('update-balance/<int:player_id>/', views.update_balance, name='update-balance-alt'),
    
    # ============ ENDPOINTS ESPECIALES DEL VIEWSET ============
    # Nota: Estos ya están incluidos en el router, pero si necesitas URLs directas:
    # path('players/my/profile/', views.PlayerViewSet.as_view({'get': 'my_profile'}), name='player-my-profile'),
    # path('players/my/balance/', views.PlayerViewSet.as_view({'get': 'my_balance_endpoint'}), name='player-my-balance'),
]