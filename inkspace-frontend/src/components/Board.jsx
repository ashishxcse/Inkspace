import { useEffect, useRef, useState } from "react";

// Canvas ka size fix hai, taaki sabki screen par coordinates same rahein.
const W = 1200;
const H = 700;
const COLORS = ["#16213e", "#e5484d", "#2457f5", "#12a150", "#f5a623", "#8e4ec6"];

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function drawLine(ctx, from, to, color, width) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
  ctx.stroke();
}

// Text: points[0] = text ki top-left position, width = font size
function drawText(ctx, s) {
  ctx.fillStyle = s.color;
  ctx.font = `${s.width}px "Public Sans", system-ui, sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(s.text, s.points[0][0], s.points[0][1]);
}

function drawStroke(ctx, s) {
  if (s.kind === "text") {
    drawText(ctx, s);
    return;
  }
  const pts = s.points;
  if (pts.length === 1) {
    // sirf ek click: chhota dot
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(pts[0][0], pts[0][1], s.width / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.strokeStyle = s.color;
  ctx.lineWidth = s.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

export default function Board({ roomId, strokes, send, sendStroke, segmentSink, live }) {
  const canvasRef = useRef(null);
  const currentRef = useRef(null); // jo stroke abhi ban raha hai
  const textRef = useRef(null);    // textbox ka input element
  const doneRef = useRef(false);   // textbox ek hi baar save ho, isliye guard
  const [tool, setTool] = useState("pen"); // pen | text | eraser
  const [color, setColor] = useState(COLORS[0]);
  const [width, setWidth] = useState(4);
  const [textBox, setTextBox] = useState(null); // khula hua textbox (ya null)

  // strokes badlein toh poora board dobara banao (undo/redo/clear ka yehi tarika hai).
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);
    strokes.forEach((s) => s.active && drawStroke(ctx, s));
    if (currentRef.current) drawStroke(ctx, currentRef.current);
  }, [strokes]);

  // Dusre ka live segment aaye toh Room.jsx isi function ko call karta hai.
  useEffect(() => {
    segmentSink.current = (m) =>
      drawLine(canvasRef.current.getContext("2d"), m.from, m.to, m.color, m.width);
    return () => { segmentSink.current = null; };
  }, [segmentSink]);

  // Textbox khulte hi usme cursor chala jaye.
  useEffect(() => {
    if (textBox) {
      doneRef.current = false;
      textRef.current?.focus();
    }
  }, [textBox]);

  // Mouse/touch position ko canvas ke 1200x700 coordinates mein badlo.
  const toPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return [
      Math.round((e.clientX - rect.left) * (W / rect.width)),
      Math.round((e.clientY - rect.top) * (H / rect.height)),
    ];
  };

  /* ---------- pen / eraser ---------- */
  const onDown = (e) => {
    if (!live || e.button !== 0 || tool === "text") return;
    canvasRef.current.setPointerCapture(e.pointerId);
    currentRef.current = {
      stroke_id: newId(),
      color: tool === "eraser" ? "#ffffff" : color, // eraser = white stroke
      width: tool === "eraser" ? width * 3 : width,
      points: [toPoint(e)],
    };
    drawStroke(canvasRef.current.getContext("2d"), currentRef.current);
  };

  const onMove = (e) => {
    const cur = currentRef.current;
    if (!cur) return;
    const p = toPoint(e);
    const last = cur.points[cur.points.length - 1];
    if (p[0] === last[0] && p[1] === last[1]) return;
    cur.points.push(p);
    drawLine(canvasRef.current.getContext("2d"), last, p, cur.color, cur.width);
    send({ type: "SEGMENT", color: cur.color, width: cur.width, from: last, to: p });
  };

  const onUp = () => {
    const cur = currentRef.current;
    if (!cur) return;
    currentRef.current = null;
    sendStroke(cur); // poora stroke save + broadcast
  };

  /* ---------- text ---------- */
  const fontSize = 14 + width * 2; // slider ka "Size" text ka font size bhi decide karta hai

  const openTextBox = (e) => {
    if (!live || tool !== "text") return;
    const rect = canvasRef.current.getBoundingClientRect();
    const [x, y] = toPoint(e);
    setTextBox({
      x,
      y,
      size: fontSize,
      left: e.clientX - rect.left,          // input ki position (screen px)
      top: e.clientY - rect.top,
      px: fontSize * (rect.width / W),      // input ka font size screen par canvas jaisa dikhe
    });
  };

  const commitText = () => {
    if (!textBox || doneRef.current) return;
    doneRef.current = true;
    const value = textRef.current ? textRef.current.value.trim() : "";
    setTextBox(null);
    if (value) {
      sendStroke({
        stroke_id: newId(),
        kind: "text",
        text: value,
        color,
        width: textBox.size,
        points: [[textBox.x, textBox.y]],
      });
    }
  };

  const cancelText = () => {
    doneRef.current = true;
    setTextBox(null);
  };

  /* ---------- baaki buttons ---------- */
  const clearBoard = () => {
    if (window.confirm("Clear the whole board for everyone?")) send({ type: "CLEAR" });
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `inkspace-${roomId}.png`;
    a.click();
  };

  return (
    <section className="board">
      <div className="toolbar" role="toolbar" aria-label="Drawing tools">
        <div className="tool-group">
          <button className="tool-btn" aria-pressed={tool === "pen"} onClick={() => setTool("pen")}>
            Pen
          </button>
          <button className="tool-btn" aria-pressed={tool === "text"} onClick={() => setTool("text")}>
            Text
          </button>
          <button className="tool-btn" aria-pressed={tool === "eraser"} onClick={() => setTool("eraser")}>
            Eraser
          </button>
        </div>

        <div className="tool-group">
          {COLORS.map((c) => (
            <button
              key={c}
              className="swatch"
              style={{ background: c }}
              aria-label={`Color ${c}`}
              aria-pressed={tool !== "eraser" && color === c}
              onClick={() => { setColor(c); if (tool === "eraser") setTool("pen"); }}
            />
          ))}
        </div>

        <label className="tool-group size">
          Size
          <input type="range" min="2" max="24" value={width} onChange={(e) => setWidth(+e.target.value)} />
        </label>

        <div className="tool-group tool-end">
          <button className="btn btn-outline" onClick={() => send({ type: "UNDO" })} disabled={!live}>Undo</button>
          <button className="btn btn-outline" onClick={() => send({ type: "REDO" })} disabled={!live}>Redo</button>
          <button className="btn btn-outline" onClick={clearBoard} disabled={!live}>Clear</button>
          <button className="btn btn-outline" onClick={download}>Download PNG</button>
        </div>
      </div>

      {tool === "text" && (
        <p className="tool-hint">Click on the board, type your text, then press Enter. Press Esc to cancel.</p>
      )}

      <div className="canvas-wrap">
        <canvas
          ref={canvasRef}
          className={tool === "text" ? "canvas is-text" : "canvas"}
          width={W}
          height={H}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClick={openTextBox}
        />
        {textBox && (
          <input
            ref={textRef}
            className="text-input"
            style={{ left: textBox.left, top: textBox.top, fontSize: textBox.px, color }}
            maxLength={200}
            aria-label="Text to add on the board"
            onKeyDown={(e) => {
              if (e.key === "Enter") commitText();
              if (e.key === "Escape") cancelText();
            }}
            onBlur={commitText}
          />
        )}
      </div>
    </section>
  );
}
