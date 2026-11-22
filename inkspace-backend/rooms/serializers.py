from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    owner = serializers.CharField(source="owner.username", read_only=True)
    participants = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = ["room_id", "owner", "created_at", "participants"]

    def get_participants(self, obj):
        return [p.user.username for p in obj.participants.select_related("user")]