import { useEffect, useRef, useState } from "react";

export default function Chat({ messages, onSend, disabled }) {
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const me = localStorage.getItem("username");

  // Naya message aaye toh list neeche scroll ho jaye.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onSend(t);
    setText("");
  };

  return (
    <section className="panel chat">
      <h2>Chat</h2>
      <ul className="chat-list" ref={listRef} aria-live="polite">
        {messages.length === 0 && <li className="chat-empty">No messages yet. Say hi.</li>}
        {messages.map((m) => (
          <li key={m.id} className={m.user === me ? "msg msg-me" : "msg"}>
            {m.user !== me && <span className="msg-user">{m.user}</span>}
            <span className="msg-text">{m.text}</span>
          </li>
        ))}
      </ul>
      <form className="chat-form" onSubmit={submit}>
        <input
          aria-label="Message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
          placeholder="Type a message"
          disabled={disabled}
        />
        <button className="btn btn-primary" disabled={disabled || !text.trim()}>Send</button>
      </form>
    </section>
  );
}
