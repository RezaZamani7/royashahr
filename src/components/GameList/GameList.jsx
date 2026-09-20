import { useNavigate } from "react-router-dom";
import { useGame } from "../../context/GameContext";

// صفحه‌ی لیست بازی‌ها که داخل مرورگر داخلی ساختمان بازی باز می‌شود.
export default function GameList() {
  const { profile } = useGame();
  const navigate = useNavigate();

  const games = [
    { path: "/game/2048", icon: "🎮", name: "۲۰۴۸", best: profile?.high_2048 },
    { path: "/game/tetris", icon: "🧩", name: "تتریس", best: profile?.high_tetris },
    { path: "/game/dino", icon: "🦕", name: "دایناسور", best: profile?.high_dino },
    { path: "/game/snake", icon: "🐍", name: "مار", best: profile?.high_snake },
  ];

  return (
    <div className="gamelist-page">
      <h1>لیست بازی‌ها</h1>
      <div className="games-grid">
        {games.map((g) => (
          <div
            key={g.path}
            className="game-card"
            onClick={() => (window.location.href = g.path)}
          >
            <div className="game-icon">{g.icon}</div>
            <h3>{g.name}</h3>
            <p className="best">بهترین: {g.best?.toLocaleString("fa-IR") || "۰"}</p>
          </div>
        ))}
      </div>
      <button className="btn-secondary" onClick={() => navigate("/world")}>
        بازگشت به شهر
      </button>
    </div>
  );
}
