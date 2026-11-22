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
<<<<<<< HEAD
        return f"{self.user.username} in {self.room.room_id}"
=======
        return f"{self.user.username} in {self.room.room_id}"
    
    
    
    


class Stroke(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="strokes")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stroke_id = models.CharField(max_length=40, unique=True)
    color = models.CharField(max_length=9)
    width = models.PositiveSmallIntegerField()
    points = models.JSONField()                      # [[x, y], [x, y], ...]
    is_active = models.BooleanField(default=True)    # undo = False
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]


class Message(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="messages")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        

class Stroke(models.Model):
    kind = models.CharField(max_length=10, default="pen")
    text = models.CharField(max_length=300, blank=True, default="")
>>>>>>> 8f107ed (Initial commit)
