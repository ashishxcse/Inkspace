import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorText } from "../api";
import Header from "../components/Header.jsx";

export default function Room() {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const me = localStorage.getItem("username");

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

    // Har 3 second mein participants list refresh hoti hai.
    // Phase 4 mein ye polling WebSocket se replace ho jayegi.
    const timer = setInterval(refresh, 3000);
    return () => { stopped = true; clearInterval(timer); };
  }, [roomId]);

  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1800);
  };

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
        </div>
      </main>
    </>
  );
}
