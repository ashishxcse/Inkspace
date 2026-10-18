from django.urls import path
from . import views

urlpatterns = [
    path("", views.create_room),
    path("join/", views.join_room),
    path("<str:room_id>/", views.room_detail),
]