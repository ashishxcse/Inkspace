import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, errorText } from "../api";
import Header from "../components/Header.jsx";

export default function Dashboard() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const createRoom = async () => {
    setError("");
    setBusy(true);
    try {
      const room = await api("/rooms/", { method: "POST" });
      navigate(`/room/${room.room_id}`);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    const room_id = code.trim().toUpperCase();
    if (!room_id) return;
    setError("");
    setBusy(true);
    try {
      const room = await api("/rooms/join/", { method: "POST", body: { room_id } });
      navigate(`/room/${room.room_id}`);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <>
      <Header />
      <main className="page">
        <h1 className="page-title">Hi, {username}</h1>
        <p className="page-sub">Start a board, or join one a teammate shared with you.</p>

        {error && <div className="alert" role="alert">{error}</div>}

        <div className="grid-2">
          <section className="panel panel-primary">
            <h2>Start a new board</h2>
            <p>You get a room code to share with everyone who should draw with you.</p>
            <button className="btn btn-light" onClick={createRoom} disabled={busy}>
              Create room
            </button>
          </section>

          <section className="panel">
            <h2>Join a board</h2>
            <p>Enter the 6-character code your teammate sent you.</p>
            <form className="join-form" onSubmit={joinRoom}>
              <label htmlFor="code">Room code</label>
              <div className="join-row">
                <input id="code" value={code} maxLength={10} autoComplete="off"
                  onChange={(e) => setCode(e.target.value)} placeholder="AB12CD" />
                <button className="btn btn-primary" disabled={busy || !code.trim()}>
                  Join room
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </>
  );
}
