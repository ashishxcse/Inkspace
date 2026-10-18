export default function Wordmark({ large = false }) {
  return (
    <div className={large ? "wordmark wordmark-large" : "wordmark"}>
      <span className="wordmark-text">Inkspace</span>
      <svg className="wordmark-stroke" viewBox="0 0 200 14" aria-hidden="true">
        <path
          pathLength="1"
          d="M2 9 C 30 2, 50 13, 80 7 S 130 2, 160 8 S 190 10, 198 5"
        />
      </svg>
    </div>
  );
}
