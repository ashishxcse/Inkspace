import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api";
import Wordmark from "./Wordmark.jsx";

export default function Header() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <Link to="/" className="topbar-brand" aria-label="Inkspace home">
        <Wordmark />
      </Link>
      <div className="topbar-user">
        <span>{username}</span>
        <button className="btn btn-quiet" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}
