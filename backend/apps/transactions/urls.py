# backend/apps/transactions/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'transactions', views.TransactionViewSet, basename='transaction')
router.register(r'cancellations', views.CancellationRequestViewSet, basename='cancellation')
router.register(r'history', views.TransactionHistoryViewSet, basename='transaction-history')

urlpatterns = [
    path('', include(router.urls)),
]

# backend/apps/memberships/urls.py
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

# backend/casinoChill/urls.py (actualizado)
urlpatterns = [
    # ... URLs existentes ...
    path('api/transactions/', include('transactions.urls')),
    path('api/memberships/', include('memberships.urls')),
]