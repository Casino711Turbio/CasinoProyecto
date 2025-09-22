from django.http import JsonResponse
from django.shortcuts import render

def home_view(request):
    """
    Vista simple para la página de inicio que muestra información sobre la API
    """
    api_info = {
        "message": "Bienvenido a CasinoChill API",
        "version": "1.0",
        "endpoints": {
            "admin": "/admin/",
            "api_documentation": "Por implementar",
            "authentication": {
                "login": "/api/token/",
                "refresh": "/api/token/refresh/",
                "register": "/api/auth/register/"
            },
            "players": "/api/players/",
            "memberships": "/api/memberships/",
            "games": "/api/games/"
        }
    }
    return JsonResponse(api_info)