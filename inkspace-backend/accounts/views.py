from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .serializers import RegisterSerializer


@api_view(["POST"])
@permission_classes([AllowAny])        # register ke liye login nahi chahiye
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)   # galat data par automatic 400 error
    serializer.save()
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def me(request):
    return Response({"id": request.user.id, "username": request.user.username})