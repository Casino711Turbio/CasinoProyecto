from rest_framework import viewsets
from rest_framework import generics
from rest_framework import permissions
from .models import Membership
from .serializers import MembershipSerializer
from rest_framework import viewsets, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

class MembershipViewSet(viewsets.ModelViewSet):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    
class MembershipListView(generics.ListAPIView):
    queryset = Membership.objects.all()
    serializer_class = MembershipSerializer
    permission_classes = [permissions.AllowAny]