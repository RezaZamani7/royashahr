import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { GameProvider } from "./context/GameContext";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import Game2048 from "./components/Games/Game2048";
import Tetris from "./components/Games/Tetris";
import DinoGame from "./components/Games/DinoGame";
import Snake from "./components/Games/Snake";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import "./style.css";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <GameProvider>
          <div className="app" dir="rtl">
            <Routes>
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/game/2048" element={<PrivateRoute><Game2048 /></PrivateRoute>} />
              <Route path="/game/tetris" element={<PrivateRoute><Tetris /></PrivateRoute>} />
              <Route path="/game/dino" element={<PrivateRoute><DinoGame /></PrivateRoute>} />
              <Route path="/game/snake" element={<PrivateRoute><Snake /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </GameProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;