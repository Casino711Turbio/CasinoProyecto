from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

def index(request):
    return JsonResponse({"message": "Authentication API funcionando ✅"})

urlpatterns = [
    # Ejemplo simple
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('register/', views.register, name='auth_register'),
]
