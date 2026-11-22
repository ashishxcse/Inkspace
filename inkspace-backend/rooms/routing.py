from django.urls import path
from .consumers import BoardConsumer

websocket_urlpatterns = [
    path("ws/room/<str:room_id>/", BoardConsumer.as_asgi()),
]