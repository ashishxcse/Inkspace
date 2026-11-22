<<<<<<< HEAD
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorText } from "../api";
import Header from "../components/Header.jsx";

=======
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorText } from "../api";
import Header from "../components/Header.jsx";
import Board from "../components/Board.jsx";
import Chat from "../components/Chat.jsx";
import useRoomSocket from "../hooks/useRoomSocket.js";

// Bahar wala component: room join karta hai aur participants list refresh karta hai.
>>>>>>> 8f107ed (Initial commit)
export default function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
<<<<<<< HEAD
  const [copied, setCopied] = useState("");
  const me = localStorage.getItem("username");
=======
>>>>>>> 8f107ed (Initial commit)

  useEffect(() => {
    let stopped = false;

    const refresh = async () => {
      try {
        const data = await api(`/rooms/${roomId}/`);
        if (!stopped) { setRoom(data); setError(""); }
      } catch (err) {
        if (!stopped) setError(errorText(err));
      }
    };

    // Invite link se aane wala user bhi automatically room mein add ho jata hai.
    api("/rooms/join/", { method: "POST", body: { room_id: roomId } })
      .then((data) => { if (!stopped) setRoom(data); })
      .catch((err) => { if (!stopped) setError(errorText(err)); });

<<<<<<< HEAD
    // Har 3 second mein participants list refresh hoti hai.
    // Phase 4 mein ye polling WebSocket se replace ho jayegi.
=======
>>>>>>> 8f107ed (Initial commit)
    const timer = setInterval(refresh, 3000);
    return () => { stopped = true; clearInterval(timer); };
  }, [roomId]);

<<<<<<< HEAD
  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1800);
  };

=======
>>>>>>> 8f107ed (Initial commit)
  if (!room) {
    return (
      <>
        <Header />
        <main className="page">
          {error ? (
            <>
              <div className="alert" role="alert">{error}</div>
              <Link to="/" className="btn btn-outline">Back to dashboard</Link>
            </>
          ) : (
            <p className="page-sub">Opening room...</p>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
<<<<<<< HEAD
      <main className="page">
        <div className="room-head">
          <div>
            <p>Room code</p>
            <div className="code">{room.room_id}</div>
          </div>
          <div className="room-actions">
            <button className="btn btn-outline" onClick={() => copy(room.room_id, "code")}>
              {copied === "code" ? "Code copied" : "Copy code"}
            </button>
            <button
              className="btn btn-outline"
              onClick={() => copy(`${window.location.origin}/room/${room.room_id}`, "link")}
            >
              {copied === "link" ? "Link copied" : "Copy invite link"}
            </button>
            <Link to="/" className="btn btn-quiet">Leave room</Link>
          </div>
        </div>

        {error && <div className="alert" role="alert">{error}</div>}

        <div className="room-body">
          <section className="canvas-empty">
            <div>
              <h2>The canvas is coming next</h2>
              <p>
                Drawing tools and live sync arrive in the next phase. For now, anyone who
                joins with this code appears in the list.
              </p>
            </div>
          </section>

=======
      <main className="page page-wide">
        <Workspace room={room} error={error} />
      </main>
    </>
  );
}

// Room join hone ke baad hi WebSocket connect hota hai (isliye alag component).
function Workspace({ room, error }) {
  const segmentSink = useRef(null); // Board apna "live line banao" function isme rakhta hai
  const { status, strokes, messages, send, sendStroke } = useRoomSocket(room.room_id, segmentSink);
  const [copied, setCopied] = useState("");
  const me = localStorage.getItem("username");
  const live = status === "connected";

  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1800);
  };

  return (
    <>
      <div className="room-head">
        <div>
          <p>Room code</p>
          <div className="code-row">
            <div className="code">{room.room_id}</div>
            <span className={`status status-${status}`}>
              {live ? "Live" : status === "connecting" ? "Connecting..." : "Reconnecting..."}
            </span>
          </div>
        </div>
        <div className="room-actions">
          <button className="btn btn-outline" onClick={() => copy(room.room_id, "code")}>
            {copied === "code" ? "Code copied" : "Copy code"}
          </button>
          <button
            className="btn btn-outline"
            onClick={() => copy(`${window.location.origin}/room/${room.room_id}`, "link")}
          >
            {copied === "link" ? "Link copied" : "Copy invite link"}
          </button>
          <Link to="/" className="btn btn-quiet">Leave room</Link>
        </div>
      </div>

      {error && <div className="alert" role="alert">{error}</div>}

      <div className="room-body">
        <Board
          roomId={room.room_id}
          strokes={strokes}
          send={send}
          sendStroke={sendStroke}
          segmentSink={segmentSink}
          live={live}
        />

        <div className="side">
>>>>>>> 8f107ed (Initial commit)
          <aside className="panel participants">
            <h2>In this room ({room.participants.length})</h2>
            <ul>
              {room.participants.map((name) => (
                <li key={name}>
                  <span className="avatar" aria-hidden="true">{name[0]}</span>
                  <span>{name}</span>
                  <span className="tags">
                    {name === room.owner && <span className="tag">owner</span>}
                    {name === me && <span className="tag">you</span>}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
<<<<<<< HEAD
        </div>
      </main>
=======

          <Chat messages={messages} onSend={(text) => send({ type: "CHAT", text })} disabled={!live} />
        </div>
      </div>
>>>>>>> 8f107ed (Initial commit)
    </>
  );
}
