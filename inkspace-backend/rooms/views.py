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
<<<<<<< HEAD
    return Response(RoomSerializer(room).data)
=======
    return Response(RoomSerializer(room).data)



@api_view(["GET"])
def room_history(request, room_id):
    room = get_object_or_404(Room, room_id=room_id)
    if not Participant.objects.filter(room=room, user=request.user).exists():
        return Response({"detail": "Join the room first."}, status=status.HTTP_403_FORBIDDEN)

    strokes = [
        {"stroke_id": s.stroke_id, "user": s.user.username, "color": s.color,
         "width": s.width, "points": s.points, "active": s.is_active,
         "kind": s.kind, "text": s.text}
        for s in room.strokes.select_related("user")
    ]
    recent = room.messages.select_related("user").order_by("-id")[:100]
    messages = [
        {"id": m.id, "user": m.user.username, "text": m.text, "created_at": m.created_at.isoformat()}
        for m in reversed(list(recent))
    ]
    return Response({"strokes": strokes, "messages": messages})
>>>>>>> 8f107ed (Initial commit)
