from django.urls import path
from . import views
from .views import MyTokenObtainPairView, UserInfoView  # Importar nuevas vistas
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse

def index(request):
    return JsonResponse({"message": "Authentication API funcionando ✅"})

urlpatterns = [
    path('', index, name='index'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user-info/', UserInfoView.as_view(), name='user_info'),  # Nueva ruta
    path('password-reset/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('register/', views.register, name='auth_register'),
    path('register-v2/', views.RegisterView.as_view(), name='register_v2'),
]