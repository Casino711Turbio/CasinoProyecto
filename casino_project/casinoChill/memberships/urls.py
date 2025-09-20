from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MembershipViewSet
from . import views

router = DefaultRouter()
router.register(r'memberships', MembershipViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('memberships/', views.MembershipListView.as_view(), name='membership-list'),
]