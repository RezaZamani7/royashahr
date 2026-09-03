import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";
import TouchControls from "./TouchControls";

const COLS = 10;
const ROWS = 20;
const EMPTY = 0;

const PIECES = [
  { shape: [[1,1,1,1]], color: "#00f0f0", name: "I" },
  { shape: [[1,1],[1,1]], color: "#f0f000", name: "O" },
  { shape: [[0,1,0],[1,1,1]], color: "#a000f0", name: "T" },
  { shape: [[1,0,0],[1,1,1]], color: "#f0a000", name: "J" },
  { shape: [[0,0,1],[1,1,1]], color: "#0000f0", name: "L" },
  { shape: [[1,1,0],[0,1,1]], color: "#00f000", name: "S" },
  { shape: [[0,1,1],[1,1,0]], color: "#f00000", name: "Z" },
];

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function randomPiece() {
  const idx = Math.floor(Math.random() * PIECES.length);
  return { ...PIECES[idx], id: idx };
}

export default function Tetris() {
  const { submitScore, profile } = useGame();
  const navigate = useNavigate();
  const [board, setBoard] = useState(createBoard());
  const [piece, setPiece] = useState(null);
  const [pos, setPos] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const boardRef = useRef(board);
  const pieceRef = useRef(piece);
  const posRef = useRef(pos);
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  boardRef.current = board;
  pieceRef.current = piece;
  posRef.current = pos;

  function collision(b, sh, x, y) {
    for (let r = 0; r < sh.length; r++) {
      for (let c = 0; c < sh[r].length; c++) {
        if (sh[r][c] && (b[y + r] === undefined || b[y + r][x + c] === undefined || b[y + r][x + c] !== EMPTY)) {
          return true;
        }
      }
    }
    return false;
  }

  function mergeBoard(b, sh, x, y, color) {
    const nb = b.map((row) => [...row]);
    for (let r = 0; r < sh.length; r++) {
      for (let c = 0; c < sh[r].length; c++) {
        if (sh[r][c]) {
          nb[y + r][x + c] = color;
        }
      }
    }
    return nb;
  }

  function clearLines(b) {
    let cleared = 0;
    const nb = b.filter((row) => {
      const full = row.every((v) => v !== EMPTY);
      if (full) cleared++;
      return !full;
    });
    while (nb.length < ROWS) nb.unshift(Array(COLS).fill(EMPTY));
    return { board: nb, lines: cleared };
  }

  const spawnPiece = useCallback(() => {
    const newPiece = randomPiece();
    const startX = Math.floor((COLS - newPiece.shape[0].length) / 2);
    return { piece: newPiece, x: startX, y: 0 };
  }, []);

  const handleGameEnd = useCallback(async (finalScore) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    setPiece(null);
    if (finalScore > 0) {
      const res = await submitScore("tetris", finalScore);
      if (res) setResult(res);
    }
    setShowResult(true);
  }, [submitScore]);

  const lockPiece = useCallback(() => {
    const p = pieceRef.current;
    if (!p) return;
    const { x, y } = posRef.current;
    if (y <= 0) {
      handleGameEnd(scoreRef.current);
      return;
    }
    const merged = mergeBoard(boardRef.current, p.shape, x, y, p.color);
    const { board: cleared, lines: clearedLines } = clearLines(merged);
    const points = [0, 100, 300, 500, 800];
    const gained = points[clearedLines] || 0;
    boardRef.current = cleared;
    setBoard(cleared);
    scoreRef.current += gained;
    setScore((s) => s + gained);
    linesRef.current += clearedLines;
    setLines(linesRef.current);
    const newLevel = Math.floor(linesRef.current / 10) + 1;
    setLevel(newLevel);
    const spawn = spawnPiece();
    if (collision(cleared, spawn.piece.shape, spawn.x, spawn.y)) {
      handleGameEnd(scoreRef.current);
    } else {
      setPiece(spawn.piece);
      pieceRef.current = spawn.piece;
      setPos({ x: spawn.x, y: spawn.y });
      posRef.current = { x: spawn.x, y: spawn.y };
    }
  }, [spawnPiece, handleGameEnd]);

  const moveDown = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const p = pieceRef.current;
    if (!p) return;
    const { x, y } = posRef.current;
    if (!collision(boardRef.current, p.shape, x, y + 1)) {
      const newPos = { x, y: y + 1 };
      setPos(newPos);
      posRef.current = newPos;
    } else {
      lockPiece();
    }
  }, [lockPiece]);

  const moveLR = useCallback((dir) => {
    if (gameOverRef.current || pausedRef.current) return;
    const p = pieceRef.current;
    if (!p) return;
    const { x, y } = posRef.current;
    const nx = x + dir;
    if (!collision(boardRef.current, p.shape, nx, y)) {
      const newPos = { x: nx, y };
      setPos(newPos);
      posRef.current = newPos;
    }
  }, []);

  const rotate = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const p = pieceRef.current;
    if (!p) return;
    const { x, y } = posRef.current;
    const shape = p.shape;
    const rotated = shape[0].map((_, i) => shape.map((row) => row[i]).reverse());
    for (const offset of [0, -1, 1, -2, 2]) {
      if (!collision(boardRef.current, rotated, x + offset, y)) {
        const newPiece = { ...p, shape: rotated };
        setPiece(newPiece);
        pieceRef.current = newPiece;
        setPos({ x: x + offset, y });
        posRef.current = { x: x + offset, y };
        return;
      }
    }
  }, []);

  const hardDrop = useCallback(() => {
    if (gameOverRef.current || pausedRef.current) return;
    const p = pieceRef.current;
    if (!p) return;
    const { x, y } = posRef.current;
    let ny = y;
    while (!collision(boardRef.current, p.shape, x, ny + 1)) ny++;
    setPos({ x, y: ny });
    posRef.current = { x, y: ny };
    lockPiece();
  }, [lockPiece]);

  const startGame = useCallback(() => {
    const newBoard = createBoard();
    boardRef.current = newBoard;
    setBoard(newBoard);
    setScore(0);
    scoreRef.current = 0;
    setLines(0);
    linesRef.current = 0;
    setLevel(1);
    gameOverRef.current = false;
    pausedRef.current = false;
    setGameOver(false);
    setPaused(false);
    setShowResult(false);
    setResult(null);
    const spawn = spawnPiece();
    setPiece(spawn.piece);
    pieceRef.current = spawn.piece;
    setPos({ x: spawn.x, y: spawn.y });
    posRef.current = { x: spawn.x, y: spawn.y };
  }, [spawnPiece]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (gameOver) return;
    const dropSpeed = Math.max(100, 500 - (level - 1) * 50);
    const interval = setInterval(() => {
      moveDown();
    }, dropSpeed);
    return () => clearInterval(interval);
  }, [gameOver, level, moveDown]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowLeft") { e.preventDefault(); moveLR(1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); moveLR(-1); }
      else if (e.key === "ArrowDown") { e.preventDefault(); moveDown(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); rotate(); }
      else if (e.key === " ") { e.preventDefault(); hardDrop(); }
      else if (e.key === "p" || e.key === "P") {
        e.preventDefault();
        if (!gameOverRef.current) {
          pausedRef.current = !pausedRef.current;
          setPaused(pausedRef.current);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [moveLR, moveDown, rotate, hardDrop]);

  const handleTouchDirection = useCallback((dir) => {
    if (gameOverRef.current || pausedRef.current) return;
    if (dir === "left") moveLR(1);
    else if (dir === "right") moveLR(-1);
  }, [moveLR]);

  const handleTouchAction = useCallback((action) => {
    if (gameOverRef.current || pausedRef.current) {
      if (gameOverRef.current) startGame();
      return;
    }
    if (action === "rotate") rotate();
    else if (action === "drop") hardDrop();
  }, [moveLR, moveDown, rotate, hardDrop, startGame]);

  function renderBoard() {
    const display = boardRef.current.map((row) => [...row]);
    const p = pieceRef.current;
    const { x, y } = posRef.current;
    if (p) {
      for (let r = 0; r < p.shape.length; r++) {
        for (let c = 0; c < p.shape[r].length; c++) {
          if (p.shape[r][c] && display[y + r] && display[y + r][x + c] !== undefined) {
            display[y + r][x + c] = p.color;
          }
        }
      }
    }
    return display;
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <button onClick={() => navigate("/dashboard")}>← بازگشت</button>
        <h1>تتریس</h1>
        <div className="game-scores">
          <div className="score-box">امتیاز: {score.toLocaleString("fa-IR")}</div>
          <div className="score-box">سطرها: {lines.toLocaleString("fa-IR")}</div>
          <div className="score-box">سطح: {level.toLocaleString("fa-IR")}</div>
          <div className="score-box">بهترین: {(profile?.high_tetris || 0).toLocaleString("fa-IR")}</div>
        </div>
      </div>

      <div className="tetris-container">
        <div className="tetris-board">
          {renderBoard().map((row, ri) => (
            <div key={ri} className="tetris-row">
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  className="tetris-cell"
                  style={{ backgroundColor: cell !== EMPTY ? cell : "#111" }}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="tetris-side">
          <div className="tetris-controls">
            <p>🎮 راهنمای کنترل:</p>
            <p>→ : حرکت به چپ</p>
            <p>← : حرکت به راست</p>
            <p>↑ : چرخش</p>
            <p>↓ : پایین آوردن</p>
            <p>Space : رها کردن سریع</p>
            <p>P : توقف</p>
          </div>
          <button className="restart-btn" onClick={startGame}>شروع مجدد</button>
          {paused && <div className="tetris-paused">متوقف شد</div>}
        </div>
      </div>

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
            <button onClick={startGame} className="btn-primary">دوباره</button>
            <button onClick={() => navigate("/dashboard")} className="btn-secondary">داشبورد</button>
          </div>
        </div>
      )}

      <TouchControls
        type="tetris"
        onDirection={handleTouchDirection}
        onAction={handleTouchAction}
        gameOver={gameOver}
        onRestart={startGame}
      />
    </div>
  );
}
