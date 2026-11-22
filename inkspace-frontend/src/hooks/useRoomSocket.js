import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api";

const WS_BASE = "ws://127.0.0.1:8000/ws";

// Is hook ka kaam: WebSocket connect rakhna, aur room ka live data (strokes + chat) sambhalna.
export default function useRoomSocket(roomId, segmentSink) {
  const [status, setStatus] = useState("connecting"); // connecting | connected | reconnecting
  const [strokes, setStrokes] = useState([]);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const send = useCallback((data) => {
    const ws = socketRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  }, []);

  // Apna stroke: turant screen par bhi dikhao aur server ko bhi bhejo.
  const sendStroke = useCallback(
    (stroke) => {
      setStrokes((all) => [...all, { ...stroke, active: true }]);
      send({ type: "STROKE", ...stroke });
    },
    [send]
  );

  useEffect(() => {
    let closed = false;
    let retryTimer;

    // Purani drawing aur chat REST se laao (page refresh ya reconnect ke baad).
    const loadHistory = async () => {
      try {
        const data = await api(`/rooms/${roomId}/history/`);
        setStrokes(data.strokes);
        setMessages(data.messages);
      } catch {
        /* agle reconnect par dobara try hoga */
      }
    };

    const handle = (m) => {
      switch (m.type) {
        case "SEGMENT":
          segmentSink.current?.(m); // live drawing, bas canvas par dikhao
          break;
        case "STROKE":
          setStrokes((all) => [...all, { ...m, active: true }]);
          break;
        case "UNDO":
        case "REDO":
          setStrokes((all) =>
            all.map((s) => (s.stroke_id === m.stroke_id ? { ...s, active: m.type === "REDO" } : s))
          );
          break;
        case "CLEAR":
          setStrokes([]);
          break;
        case "CHAT":
          setMessages((all) => [...all, m]);
          break;
        default:
          break;
      }
    };

    const connect = () => {
      const token = localStorage.getItem("access");
      const ws = new WebSocket(`${WS_BASE}/room/${roomId}/?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        loadHistory();
      };
      ws.onmessage = (e) => handle(JSON.parse(e.data));
      ws.onclose = () => {
        if (closed) return;
        setStatus("reconnecting");
        retryTimer = setTimeout(connect, 2000); // 2 second baad dobara try
      };
    };

    connect();
    return () => {
      closed = true;
      clearTimeout(retryTimer);
      socketRef.current?.close();
    };
  }, [roomId, segmentSink]);

  return { status, strokes, messages, send, sendStroke };
}
