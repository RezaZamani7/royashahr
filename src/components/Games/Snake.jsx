import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";
import TouchControls from "./TouchControls";

const COLS = 25;
const ROWS = 20;
const CELL = 20;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;

const DIR = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

const FOOD_COLORS = ["#e74c3c", "#e67e22", "#f1c40f", "#2ecc71", "#1abc9c", "#9b59b6"];

function createSnake() {
  const startX = Math.floor(COLS / 2);
  const startY = Math.floor(ROWS / 2);
  return [
    { x: startX, y: startY },
    { x: startX - 1, y: startY },
    { x: startX - 2, y: startY },
  ];
}

function randomFood(snake) {
  let pos;
  let tries = 0;
  while (tries < 500) {
    pos = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
    if (!snake.some((s) => s.x === pos.x && s.y === pos.y)) {
      return { ...pos, color: FOOD_COLORS[Math.floor(Math.random() * FOOD_COLORS.length)] };
    }
    tries++;
  }
  return { x: 0, y: 0, color: "#e74c3c" };
}

export default function Snake() {
  const { submitScore, profile } = useGame();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [paused, setPaused] = useState(false);
  const [started, setStarted] = useState(false);

  const snakeRef = useRef(createSnake());
  const dirRef = useRef(DIR.RIGHT);
  const nextDirRef = useRef(DIR.RIGHT);
  const foodRef = useRef(randomFood(snakeRef.current));
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const startedRef = useRef(false);
  const speedRef = useRef(120);

  const startGame = useCallback(() => {
    const newSnake = createSnake();
    snakeRef.current = newSnake;
    dirRef.current = DIR.RIGHT;
    nextDirRef.current = DIR.RIGHT;
    foodRef.current = randomFood(newSnake);
    scoreRef.current = 0;
    gameOverRef.current = false;
    pausedRef.current = false;
    startedRef.current = true;
    speedRef.current = 120;
    setScore(0);
    setGameOver(false);
    setPaused(false);
    setShowResult(false);
    setResult(null);
    setStarted(true);
  }, []);

  const handleTouchDirection = useCallback((dir) => {
    if (gameOverRef.current || pausedRef.current) return;
    if (dir === "up" && dirRef.current !== DIR.DOWN) nextDirRef.current = DIR.UP;
    else if (dir === "down" && dirRef.current !== DIR.UP) nextDirRef.current = DIR.DOWN;
    else if (dir === "left" && dirRef.current !== DIR.RIGHT) nextDirRef.current = DIR.LEFT;
    else if (dir === "right" && dirRef.current !== DIR.LEFT) nextDirRef.current = DIR.RIGHT;
  }, []);

  const handleTouchAction = useCallback((action) => {
    if (action === "pause") {
      if (gameOverRef.current) {
        startGame();
      } else if (startedRef.current) {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
      }
    }
  }, [startGame]);

  const handleGameEnd = useCallback(async (finalScore) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    console.log("[Snake] gameOver, finalScore:", finalScore);
    if (finalScore > 0) {
      const res = await submitScore("snake", finalScore);
      console.log("[Snake] submitScore result:", res);
      if (res) setResult(res);
    } else {
      console.log("[Snake] finalScore is 0, skipping submitScore");
    }
    setShowResult(true);
  }, [submitScore]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        if (gameOverRef.current) {
          startGame();
        } else if (startedRef.current) {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }
        return;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        if (dirRef.current !== DIR.DOWN) nextDirRef.current = DIR.UP;
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        if (dirRef.current !== DIR.UP) nextDirRef.current = DIR.DOWN;
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        if (dirRef.current !== DIR.RIGHT) nextDirRef.current = DIR.LEFT;
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        if (dirRef.current !== DIR.LEFT) nextDirRef.current = DIR.RIGHT;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [startGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let interval;

    const drawCell = (x, y, color, isHead = false) => {
      const px = x * CELL;
      const py = y * CELL;
      ctx.fillStyle = color;
      ctx.fillRect(px + 1, py + 1, CELL - 2, CELL - 2);
      if (isHead) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(px + 3, py + 3, CELL - 6, CELL - 6);
      }
    };

    const drawGrid = () => {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, BOARD_H);
        ctx.stroke();
      }
      for (let i = 0; i <= ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(BOARD_W, i * CELL);
        ctx.stroke();
      }
    };

    const drawSnake = () => {
      const snake = snakeRef.current;
      for (let i = 0; i < snake.length; i++) {
        const seg = snake[i];
        if (i === 0) {
          drawCell(seg.x, seg.y, "#00e676", true);
        } else {
          const shade = Math.floor(76 - (i * 2));
          drawCell(seg.x, seg.y, `rgb(0, ${Math.max(150, 230 - i * 4)}, 100)`);
        }
      }
    };

    const drawFood = () => {
      const food = foodRef.current;
      ctx.fillStyle = food.color;
      const px = food.x * CELL;
      const py = food.y * CELL;
      ctx.beginPath();
      ctx.arc(px + CELL / 2, py + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(px + CELL / 2 - 2, py + CELL / 2 - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = () => {
      drawGrid();
      drawSnake();
      drawFood();
    };

    const tick = () => {
      if (gameOverRef.current || !startedRef.current || pausedRef.current) return;

      dirRef.current = nextDirRef.current;
      const snake = snakeRef.current;
      const head = { x: snake[0].x + dirRef.current.x, y: snake[0].y + dirRef.current.y };

      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        handleGameEnd(scoreRef.current);
        return;
      }

      if (snake.some((s) => s.x === head.x && s.y === head.y)) {
        handleGameEnd(scoreRef.current);
        return;
      }

      snake.unshift(head);

      const food = foodRef.current;
      if (head.x === food.x && head.y === food.y) {
        scoreRef.current += 10;
        setScore(scoreRef.current);
        if (scoreRef.current % 50 === 0 && speedRef.current > 60) {
          speedRef.current -= 5;
          clearInterval(interval);
          interval = setInterval(tick, speedRef.current);
        }
        foodRef.current = randomFood(snake);
      } else {
        snake.pop();
      }

      draw();
    };

    if (started) {
      draw();
      interval = setInterval(tick, speedRef.current);
    } else {
      draw();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [started, handleGameEnd]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <div className="game-page">
      <div className="game-header">
        <button onClick={() => navigate("/dashboard")}>← بازگشت</button>
        <h1>مار</h1>
        <div className="game-scores">
          <div className="score-box">امتیاز: {score.toLocaleString("fa-IR")}</div>
          <div className="score-box">بهترین: {(profile?.high_snake || 0).toLocaleString("fa-IR")}</div>
        </div>
      </div>

      <div className="snake-container">
        <canvas
          ref={canvasRef}
          width={BOARD_W}
          height={BOARD_H}
          className="snake-canvas"
        />
        <div className="snake-side">
          <div className="snake-info">
            <p>🐍 طول: {(Math.floor((score || 0) / 10) + 3).toLocaleString("fa-IR")}</p>
            <p>⭐ امتیاز: {score.toLocaleString("fa-IR")}</p>
          </div>
          <div className="snake-controls">
            <p>🎮 راهنما:</p>
            <p>← ↑ → ↓ حرکت</p>
            <p>WASD حرکت</p>
            <p>Space توقف</p>
          </div>
          <button className="restart-btn" onClick={startGame}>شروع مجدد</button>
        </div>
      </div>

      {paused && !gameOver && (
        <div className="snake-overlay-text">متوقف شد - Space را بزنید</div>
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
            {score > 0 && !result && (
              <p style={{ color: "#e17055" }}>⚠️ امتیاز ذخیره نشد. در consول مرورگر خطا را بررسی کنید.</p>
            )}
            <button onClick={startGame} className="btn-primary">دوباره</button>
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">داشبورد</button>
          </div>
        </div>
      )}

      <TouchControls
        type="snake"
        onDirection={handleTouchDirection}
        onAction={handleTouchAction}
        gameOver={gameOver}
        onRestart={startGame}
      />
    </div>
  );
}
