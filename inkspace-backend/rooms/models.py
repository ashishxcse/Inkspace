import random
import string
from django.db import models
from django.contrib.auth.models import User


def generate_room_id():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Room(models.Model):
    room_id = models.CharField(max_length=10, unique=True, default=generate_room_id)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_rooms")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room_id


class Participant(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("room", "user")

    def __str__(self):
        return f"{self.user.username} in {self.room.room_id}"