from django.urls import path
from . import views

urlpatterns = [
    path("", views.create_room),
    path("join/", views.join_room),
    path("<str:room_id>/", views.room_detail),
<<<<<<< HEAD
=======
    path("<str:room_id>/history/", views.room_history),
>>>>>>> 8f107ed (Initial commit)
]