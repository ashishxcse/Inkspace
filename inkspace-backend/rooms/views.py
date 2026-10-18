from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Room, Participant
from .serializers import RoomSerializer


@api_view(["POST"])
def create_room(request):
    room = Room.objects.create(owner=request.user)
    Participant.objects.create(room=room, user=request.user)
    return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def join_room(request):
    room_id = request.data.get("room_id", "").upper()
    room = get_object_or_404(Room, room_id=room_id)
    Participant.objects.get_or_create(room=room, user=request.user)
    return Response(RoomSerializer(room).data)


@api_view(["GET"])
def room_detail(request, room_id):
    room = get_object_or_404(Room, room_id=room_id)
    return Response(RoomSerializer(room).data)