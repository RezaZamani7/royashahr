import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";

const SIZE = 4;

function createEmptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandom(grid) {
  const empty = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return grid;
}

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function transpose(grid) {
  const n = SIZE;
  const newGrid = createEmptyGrid();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      newGrid[c][r] = grid[r][c];
    }
  }
  return newGrid;
}

function slideLeft(grid) {
  let score = 0;
  const newGrid = grid.map((row) => {
    const filtered = row.filter((v) => v !== 0);
    const merged = [];
    let i = 0;
    while (i < filtered.length) {
      if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
        merged.push(filtered[i] * 2);
        score += filtered[i] * 2;
        i += 2;
      } else {
        merged.push(filtered[i]);
        i++;
      }
    }
    while (merged.length < SIZE) merged.push(0);
    return merged;
  });
  return { grid: newGrid, score };
}

function moveLeft(grid) {
  return slideLeft(grid);
}

function moveRight(grid) {
  const reversed = grid.map((row) => [...row].reverse());
  const { grid: slid, score } = slideLeft(reversed);
  const newGrid = slid.map((row) => [...row].reverse());
  return { grid: newGrid, score };
}

function moveUp(grid) {
  const transposed = transpose(grid);
  const { grid: slid, score } = slideLeft(transposed);
  return { grid: transpose(slid), score };
}

function moveDown(grid) {
  const transposed = transpose(grid);
  const reversed = transposed.map((row) => [...row].reverse());
  const { grid: slid, score } = slideLeft(reversed);
  const unReversed = slid.map((row) => [...row].reverse());
  return { grid: transpose(unReversed), score };
}

function hasMoves(grid) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === 0) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

function gridsEqual(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

const TILE_COLORS = {
  0: "#cdc1b4",
  2: "#eee4da",
  4: "#ede0c8",
  8: "#f2b179",
  16: "#f59563",
  32: "#f67c5f",
  64: "#f65e3b",
  128: "#edcf72",
  256: "#edcc61",
  512: "#edc850",
  1024: "#edc53f",
  2048: "#edc22e",
  4096: "#3c3a32",
  8192: "#3c3a32",
};

export default function Game2048() {
  const { submitScore, profile } = useGame();
  const navigate = useNavigate();
  const [grid, setGrid] = useState(() => addRandom(addRandom(createEmptyGrid())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showWon, setShowWon] = useState(false);
  const gameOverRef = useRef(false);
  const hasWonRef = useRef(false);
  const gridRef = useRef(grid);
  const scoreRef = useRef(0);
  const touchStartRef = useRef(null);
  gridRef.current = grid;
  scoreRef.current = score;

  const handleGameEnd = useCallback(async (finalScore) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    if (finalScore > 0) {
      const res = await submitScore("game2048", finalScore);
      if (res) setResult(res);
    }
    setShowResult(true);
  }, [submitScore]);

  const move = useCallback((dir) => {
    if (gameOverRef.current) return;
    const current = gridRef.current;
    const oldGrid = cloneGrid(current);
    let result;
    if (dir === "left") result = moveLeft(current);
    else if (dir === "right") result = moveRight(current);
    else if (dir === "up") result = moveUp(current);
    else if (dir === "down") result = moveDown(current);
    if (!result || gridsEqual(oldGrid, result.grid)) return;
    const newGrid = addRandom(result.grid);
    setGrid(newGrid);
    gridRef.current = newGrid;
    setScore((s) => s + result.score);
    if (newGrid.some((row) => row.includes(2048)) && !hasWonRef.current) {
      hasWonRef.current = true;
      setShowWon(true);
    }
    const newScore = scoreRef.current + result.score;
    if (!hasMoves(newGrid)) {
      handleGameEnd(newScore);
    }
  }, [handleGameEnd]);

  useEffect(() => {
    const handler = (e) => {
      const keyMap = { ArrowLeft: "right", ArrowRight: "left", ArrowUp: "up", ArrowDown: "down" };
      if (keyMap[e.key]) {
        e.preventDefault();
        move(keyMap[e.key]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [move]);

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    if (Math.max(absDx, absDy) < 20) return;
    if (absDx > absDy) {
      move(dx > 0 ? "right" : "left");
    } else {
      move(dy > 0 ? "down" : "up");
    }
    touchStartRef.current = null;
  };

  const restart = () => {
    const newGrid = addRandom(addRandom(createEmptyGrid()));
    setGrid(newGrid);
    gridRef.current = newGrid;
    setScore(0);
    gameOverRef.current = false;
    hasWonRef.current = false;
    setGameOver(false);
    setShowResult(false);
    setShowWon(false);
    setResult(null);
  };

  const continueAfterWin = () => {
    setShowWon(false);
  };

  return (
    <div className="game-page">
      <div className="game-header">
        <button onClick={() => navigate("/dashboard")}>← بازگشت</button>
        <h1>۲۰۴۸</h1>
        <div className="game-scores">
          <div className="score-box">امتیاز: {score.toLocaleString("fa-IR")}</div>
          <div className="score-box">بهترین: {(profile?.high_2048 || 0).toLocaleString("fa-IR")}</div>
        </div>
      </div>

      <div className="game2048-container">
        <div
          className="grid-2048"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, ri) =>
            row.map((val, ci) => (
              <div
                key={`${ri}-${ci}`}
                className="tile"
                style={{
                  backgroundColor: TILE_COLORS[val] || "#3c3a32",
                  color: val > 4 ? "#fff" : "#776e65",
                  fontSize: val > 999 ? "1.2rem" : val > 99 ? "1.6rem" : "2rem",
                }}
              >
                {val !== 0 && val.toLocaleString("fa-IR")}
              </div>
            ))
          )}
        </div>
        <button className="restart-btn" onClick={restart}>شروع مجدد</button>
      </div>

      <div className="swipe-hint">از کلیدهای جهت‌دار یا کشیدن انگشت استفاده کنید</div>

      {showWon && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>🎉 شما بردید!</h2>
            <p>به ۲۰۴۸ رسیدید!</p>
            <button onClick={continueAfterWin} className="btn-primary">ادامه بازی</button>
            <button onClick={restart} className="btn-secondary">شروع مجدد</button>
          </div>
        </div>
      )}

      {showResult && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>بازی تمام شد!</h2>
            <p>امتیاز نهایی: {score.toLocaleString("fa-IR")}</p>
            {result && (
              <>
                <p>🪙 سکه‌های دریافتی: {result.coinsEarned}</p>
                {result.flagsEarned > 0 && <p>🚩 پرچم‌های دریافتی: {result.flagsEarned}</p>}
                {result.isNewRecord && <p className="record-text">🎉 رکورد جدید!</p>}
              </>
            )}
            <button onClick={restart} className="btn-primary">دوباره</button>
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">داشبورد</button>
          </div>
        </div>
      )}
    </div>
  );
}
