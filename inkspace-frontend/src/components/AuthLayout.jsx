import Wordmark from "./Wordmark.jsx";

export default function AuthLayout({ title, children, footer }) {
  return (
    <main className="auth">
      <section className="auth-intro">
        <Wordmark large />
        <p>A shared canvas where your team draws and explains ideas together.</p>
      </section>
      <section className="auth-card">
        <h1>{title}</h1>
        {children}
        <p className="auth-footer">{footer}</p>
      </section>
    </main>
  );
}
