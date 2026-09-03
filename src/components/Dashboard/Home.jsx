import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { profile } = useGame();
  const navigate = useNavigate();

  return (
    <div className="home">
      <div className="hero">
        <h1>به رویاشهر خوش آمدید!</h1>
        <p>مرکز بازی های آنلاین - سرگرمی و مسابقه</p>
      </div>

      {profile && (
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-icon">⭐</span>
            <div>
              <p className="stat-label">مجموع امتیاز</p>
              <p className="stat-value">{profile.total_score?.toLocaleString("fa-IR") || "۰"}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon stat-icon-coin"></span>
            <div>
              <p className="stat-label">سکه ها</p>
              <p className="stat-value">{profile.coins?.toLocaleString("fa-IR") || "۰"}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat-icon">🚩</span>
            <div>
              <p className="stat-label">پرچم ها</p>
              <p className="stat-value">{profile.flags?.toLocaleString("fa-IR") || "۰"}</p>
            </div>
          </div>
        </div>
      )}

      <div className="games-grid">
        <div className="game-card" onClick={() => navigate("/game/2048")}>
          <div className="game-icon">🎮</div>
          <h3>۲۰۴۸</h3>
          <p>بازی فکری اعداد</p>
          {profile && <p className="best">بهترین: {profile.high_2048?.toLocaleString("fa-IR") || "۰"}</p>}
        </div>
        <div className="game-card" onClick={() => navigate("/game/tetris")}>
          <div className="game-icon">🧩</div>
          <h3>تتریس</h3>
          <p>بازی کلاسیک بلوکی</p>
          {profile && <p className="best">بهترین: {profile.high_tetris?.toLocaleString("fa-IR") || "۰"}</p>}
        </div>
        <div className="game-card" onClick={() => navigate("/game/dino")}>
          <div className="game-icon">🦕</div>
          <h3>دایناسور</h3>
          <p>بازی دونده</p>
          {profile && <p className="best">بهترین: {profile.high_dino?.toLocaleString("fa-IR") || "۰"}</p>}
        </div>
        <div className="game-card" onClick={() => navigate("/game/snake")}>
          <div className="game-icon">🐍</div>
          <h3>مار</h3>
          <p>بازی کلاسیک مار</p>
          {profile && <p className="best">بهترین: {profile.high_snake?.toLocaleString("fa-IR") || "۰"}</p>}
        </div>
      </div>
    </div>
  );
}
