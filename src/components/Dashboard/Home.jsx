import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";
import AdBanner from "../Ads/AdBanner";
import BrowserModal from "../Webworld/BrowserModal";

// ساختمان‌های قابل انتخاب از صفحه اصلی:
//  - ساختمان بازی: به صفحه مجموعه بازی هدایت می‌شود
//  - ساختمان مدرسه (شاد) و موزه: در مرورگر داخلی باز می‌شوند
const BUILDINGS = [
  {
    id: "games",
    icon: "🎮",
    title: "ساختمان بازی",
    desc: "مجموعه بازی‌های آنلاین",
    type: "route",
    path: "/games",
  },
  {
    id: "school",
    icon: "🏫",
    title: "ساختمان مدرسه (شاد)",
    desc: "ورود به سامانه شاد",
    type: "url",
    src: "https://web.shad.ir/",
  },
  {
    id: "museum",
    icon: "🏛️",
    title: "موزه ملی",
    desc: "تور مجازی موزه ملی ایران",
    type: "url",
    src: "https://irannationalmuseum.ir/Virtula-Tour/National%20Museum%20Virtual%20Tour.html",
  },
];

export default function Home() {
  const { profile } = useGame();
  const navigate = useNavigate();
  const [browser, setBrowser] = useState(null);

  const openBuilding = (b) => {
    if (b.type === "route") navigate(b.path);
    else setBrowser({ title: b.title, src: b.src });
  };

  return (
    <div className="home">
      <div className="hero">
        <h1>به رویاشهر خوش آمدید!</h1>
        <p>مرکز بازی های آنلاین - سرگرمی و مسابقه</p>
        <button className="btn-primary world-enter-btn" onClick={() => navigate("/world")}>
          🏙️ ورود به شهر سه‌بعدی
        </button>
      </div>

      {/* انتخاب ساختمان‌ها */}
      <div className="buildings-section">
        <h2>🏢 انتخاب ساختمان</h2>
        <div className="games-grid">
          {BUILDINGS.map((b) => (
            <div key={b.id} className="game-card" onClick={() => openBuilding(b)}>
              <div className="game-icon">{b.icon}</div>
              <h3>{b.title}</h3>
              <p>{b.desc}</p>
            </div>
          ))}
        </div>
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

      <AdBanner slotKey="home" />

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

      {browser && (
        <BrowserModal
          title={browser.title}
          src={browser.src}
          backLabel="بستن"
          onClose={() => setBrowser(null)}
        />
      )}
    </div>
  );
}
