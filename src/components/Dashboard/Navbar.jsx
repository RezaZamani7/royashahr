import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { logout, user } = useAuth();
  const { profile, updateUsername } = useGame();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSaveName = async () => {
    if (editName.trim()) {
      await updateUsername(editName.trim());
      setEditing(false);
    }
  };

  return (
    <>
      <nav className="navbar">
        <h2 className="nav-logo" onClick={() => navigate("/dashboard")}>رویاشهر</h2>
        <div className="nav-links">
          <button onClick={() => navigate("/dashboard")}>خانه</button>
          <button onClick={() => navigate("/leaderboard")}>رتبه بندی</button>
          <button onClick={() => setShowProfile(true)}>پروفایل</button>
          <button onClick={handleLogout}>خروج</button>
        </div>
      </nav>

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>پروفایل</h2>
            {profile && (
              <>
                <p><strong>ایمیل:</strong> {profile.email}</p>
                {editing ? (
                  <div className="edit-name">
                    <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                    <button onClick={handleSaveName}>ذخیره</button>
                    <button onClick={() => setEditing(false)}>لغو</button>
                  </div>
                ) : (
                  <p>
                    <strong>نام کاربری:</strong> {profile.username}{" "}
                    <button onClick={() => { setEditName(profile.username); setEditing(true); }}>ویرایش</button>
                  </p>
                )}
                <p><strong>مجموع امتیاز:</strong> {profile.total_score?.toLocaleString("fa-IR")}</p>
                <p><strong>سکه ها:</strong> {profile.coins?.toLocaleString("fa-IR")}</p>
                <p><strong>پرچم ها:</strong> {profile.flags?.toLocaleString("fa-IR")}</p>
                <h3>بیشترین امتیازها</h3>
                <p>۲۰۴۸: {profile.high_2048?.toLocaleString("fa-IR") || "۰"}</p>
                <p>تتریس: {profile.high_tetris?.toLocaleString("fa-IR") || "۰"}</p>
                <p>دایناسور: {profile.high_dino?.toLocaleString("fa-IR") || "۰"}</p>
                <p>مار: {profile.high_snake?.toLocaleString("fa-IR") || "۰"}</p>
              </>
            )}
            <button className="close-btn" onClick={() => setShowProfile(false)}>بستن</button>
          </div>
        </div>
      )}
    </>
  );
}