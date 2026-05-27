from django.urls import path, include
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('admin/', admin.site.urls),
    
    # ✅ ELIMINADO: Ya no necesitas esta línea porque está en authentication/urls.py
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Mantén el token refresh aquí si quieres, o muévelo a authentication/urls.py
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/memberships/', include('backend.apps.memberships.urls')),
    path('api/players/', include('backend.apps.players.urls')),
    path('api/games/', include('backend.apps.games.urls')),
    path('api/auth/', include('backend.apps.authentication.urls')),  # Aquí está tu user-info
    path('api/transactions/', include('backend.apps.transactions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)