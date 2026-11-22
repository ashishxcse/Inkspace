import traceback

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import Message, Participant, Room, Stroke


class BoardConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"].upper()
        self.group = f"room_{self.room_id}"

        if self.user.is_anonymous or not await self.is_participant():
            await self.close()
            return

        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group, self.channel_name)

    async def receive_json(self, content):
        kind = content.get("type")
        try:
            if kind == "SEGMENT":        # live drawing: sirf dikhane ke liye, save nahi hota
                await self.broadcast({
                    "type": "SEGMENT",
                    "color": str(content["color"])[:9],
                    "width": int(content["width"]),
                    "from": content["from"],
                    "to": content["to"],
                })

            elif kind == "STROKE":       # stroke ya text poora hua: DB mein save + sabko bhejo
                is_text = content.get("kind") == "text"
                stroke = {
                    "type": "STROKE",
                    "kind": "text" if is_text else "pen",
                    "text": str(content.get("text", ""))[:200] if is_text else "",
                    "stroke_id": str(content["stroke_id"])[:40],
                    "color": str(content["color"])[:9],
                    "width": int(content["width"]),
                    "points": content["points"][:5000],
                }
                if is_text and not stroke["text"].strip():
                    return
                await self.save_stroke(stroke)
                await self.broadcast(stroke)

            elif kind in ("UNDO", "REDO"):
                stroke_id = await self.toggle_last(kind == "REDO")
                if stroke_id:
                    await self.broadcast({"type": kind, "stroke_id": stroke_id}, include_self=True)

            elif kind == "CLEAR":
                await self.clear_board()
                await self.broadcast({"type": "CLEAR"}, include_self=True)

            elif kind == "CHAT":
                text = str(content.get("text", "")).strip()[:500]
                if text:
                    message = await self.save_message(text)
                    await self.broadcast({"type": "CHAT", **message}, include_self=True)

        except Exception:
            traceback.print_exc()   # asli error terminal mein dikhegi

    # ---- group ko message bhejna ----
    async def broadcast(self, payload, include_self=False):
        await self.channel_layer.group_send(self.group, {
            "type": "relay",
            "payload": {**payload, "user": self.user.username},
            "sender": None if include_self else self.channel_name,
        })

    async def relay(self, event):
        if event["sender"] != self.channel_name:
            await self.send_json(event["payload"])

    # ---- database ka kaam ----
    @database_sync_to_async
    def is_participant(self):
        return Participant.objects.filter(room__room_id=self.room_id, user=self.user).exists()

    @database_sync_to_async
    def save_stroke(self, s):
        room = Room.objects.get(room_id=self.room_id)
        Stroke.objects.filter(room=room, user=self.user, is_active=False).delete()
        Stroke.objects.create(
            room=room, user=self.user, stroke_id=s["stroke_id"],
            color=s["color"], width=s["width"], points=s["points"],
            kind=s["kind"], text=s["text"],
        )

    @database_sync_to_async
    def toggle_last(self, make_active):
        stroke = (
            Stroke.objects
            .filter(room__room_id=self.room_id, user=self.user, is_active=not make_active)
            .order_by("-id").first()
        )
        if stroke:
            stroke.is_active = make_active
            stroke.save(update_fields=["is_active"])
            return stroke.stroke_id

    @database_sync_to_async
    def clear_board(self):
        Stroke.objects.filter(room__room_id=self.room_id).delete()

    @database_sync_to_async
    def save_message(self, text):
        room = Room.objects.get(room_id=self.room_id)
        m = Message.objects.create(room=room, user=self.user, text=text)
        return {"id": m.id, "text": m.text, "created_at": m.created_at.isoformat()}