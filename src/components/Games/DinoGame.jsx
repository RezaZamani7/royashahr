import { useState, useEffect, useCallback, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";

const CANVAS_W = 800;
const CANVAS_H = 200;
const GROUND_Y = 170;
const DINO_X = 60;
const DINO_W = 44;
const DINO_H = 48;
const GRAVITY = 0.6;
const JUMP_FORCE = -11;
const CACTUS_TYPES = [
  { w: 18, h: 35, type: "small" },
  { w: 26, h: 50, type: "medium" },
  { w: 34, h: 50, type: "tall" },
  { w: 50, h: 35, type: "wide" },
];
const PTERO_W = 46;
const PTERO_H = 30;
const PTERO_Y_LEVELS = [60, 100, 140];

function drawDino(ctx, x, y, ducking, frame) {
  ctx.fillStyle = "#535353";

  if (ducking) {
    ctx.fillRect(x, y + 20, 50, 24);
    ctx.fillRect(x + 48, y + 22, 8, 22);
    ctx.fillStyle = "#fff";
    ctx.fillRect(x + 52, y + 26, 4, 4);
    ctx.fillStyle = "#535353";
    const legUp = Math.floor(frame / 4) % 2 === 0;
    if (legUp) {
      ctx.fillRect(x + 14, y + 38, 6, 6);
    } else {
      ctx.fillRect(x + 26, y + 38, 6, 6);
    }
    return;
  }

  ctx.fillRect(x + 22, y, 22, 24);
  ctx.fillRect(x + 2, y + 14, 30, 20);
  ctx.fillRect(x + 0, y + 20, 6, 16);
  ctx.fillRect(x + 30, y + 20, 6, 16);

  ctx.fillRect(x + 26, y + 2, 2, 4);
  ctx.fillRect(x + 30, y + 2, 2, 4);

  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 34, y + 6, 6, 6);
  ctx.fillStyle = "#535353";
  ctx.fillRect(x + 36, y + 8, 3, 3);

  ctx.fillRect(x + 30, y + 18, 4, 2);

  const legUp = Math.floor(frame / 4) % 2 === 0;
  if (legUp) {
    ctx.fillRect(x + 4, y + 36, 8, 4);
    ctx.fillRect(x + 6, y + 40, 4, 8);
    ctx.fillRect(x + 20, y + 36, 8, 4);
    ctx.fillRect(x + 22, y + 38, 6, 4);
  } else {
    ctx.fillRect(x + 4, y + 36, 8, 4);
    ctx.fillRect(x + 4, y + 38, 6, 4);
    ctx.fillRect(x + 20, y + 36, 8, 4);
    ctx.fillRect(x + 22, y + 40, 6, 6);
  }

  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 44, y + 20, 4, 6);
}

function drawCactus(ctx, obs) {
  ctx.fillStyle = "#2d6a4f";
  const s = obs.scale || 1;
  const cx = obs.x;
  const cy = obs.y;
  const w = obs.w;
  const h = obs.h;

  if (obs.type === "small") {
    ctx.fillRect(cx + w / 2 - 3, cy, 6, h);
    ctx.fillRect(cx, cy + h * 0.35, 6, 4);
    ctx.fillRect(cx + w - 6, cy + h * 0.2, 6, 6);
  } else if (obs.type === "medium") {
    ctx.fillRect(cx + w / 2 - 4, cy, 8, h);
    ctx.fillRect(cx, cy + h * 0.3, 8, 5);
    ctx.fillRect(cx + w - 8, cy + h * 0.15, 8, 6);
    ctx.fillStyle = "#1b4332";
    ctx.fillRect(cx + w / 2 - 4, cy + 4, 2, h - 8);
  } else if (obs.type === "tall") {
    ctx.fillRect(cx + w / 2 - 5, cy, 10, h);
    ctx.fillRect(cx, cy + h * 0.4, 8, 6);
    ctx.fillRect(cx + w - 8, cy + h * 0.25, 8, 7);
    ctx.fillStyle = "#1b4332";
    ctx.fillRect(cx + w / 2 - 5, cy + 3, 2, h - 6);
  } else if (obs.type === "wide") {
    ctx.fillRect(cx, cy + 6, w, h - 6);
    ctx.fillRect(cx + 8, cy, w - 16, h);
    ctx.fillStyle = "#1b4332";
    ctx.fillRect(cx + 12, cy + 8, 2, h - 16);
    ctx.fillRect(cx + w - 14, cy + 8, 2, h - 16);
  }
}

function drawPtero(ctx, obs, frame) {
  ctx.fillStyle = "#535353";
  const x = obs.x;
  const y = obs.y;
  const flap = Math.floor(frame / 8) % 2 === 0;
  if (flap) {
    ctx.fillRect(x + 8, y, PTERO_W - 16, 6);
    ctx.fillRect(x + 20, y + 4, 4, PTERO_H - 4);
    ctx.fillRect(x + 14, y - 2, 8, 4);
    ctx.fillRect(x, y, 14, 6);
    ctx.fillRect(x + 30, y, 16, 6);
  } else {
    ctx.fillRect(x + 8, y, PTERO_W - 16, 6);
    ctx.fillRect(x + 20, y + 4, 4, PTERO_H - 4);
    ctx.fillRect(x + 14, y + 4, 8, 8);
    ctx.fillRect(x, y, 14, 6);
    ctx.fillRect(x + 30, y, 16, 6);
  }
  ctx.fillStyle = "#fff";
  ctx.fillRect(x + 6, y + 1, 3, 3);
}

function drawCloud(ctx, x, y) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fillRect(x, y, 24, 4);
  ctx.fillRect(x + 4, y - 4, 16, 8);
  ctx.fillRect(x + 8, y - 8, 8, 4);
}

function drawGround(ctx, offset) {
  ctx.fillStyle = "#535353";
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 2);
  for (let i = 0; i < CANVAS_W; i += 12) {
    const x = ((i - offset % 12) + CANVAS_W) % CANVAS_W;
    ctx.fillRect(x, GROUND_Y + 2, 6, 1);
  }
  for (let i = 6; i < CANVAS_W; i += 24) {
    const x = ((i - offset % 24) + CANVAS_W) % CANVAS_W;
    ctx.fillRect(x, GROUND_Y + 4, 4, 2);
  }
}

export default function DinoGame() {
  const { submitScore, profile } = useGame();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [gameId, setGameId] = useState(0);
  const gameRef = useRef({});
  const scoreRef = useRef(0);
  const gameOverRef = useRef(false);
  const startedRef = useRef(false);

  const startGame = useCallback(() => {
    const game = {
      dino: { x: DINO_X, y: GROUND_Y - DINO_H, vy: 0 },
      obstacles: [],
      clouds: [
        { x: 100, y: 30 },
        { x: 300, y: 50 },
        { x: 500, y: 20 },
        { x: 700, y: 40 },
      ],
      speed: 6,
      score: 0,
      frame: 0,
      ducking: false,
    };
    gameRef.current = game;
    scoreRef.current = 0;
    gameOverRef.current = false;
    startedRef.current = true;
    setScore(0);
    setGameOver(false);
    setShowResult(false);
    setResult(null);
    setStarted(true);
    setGameId((id) => id + 1);
  }, []);

  const handleGameEnd = useCallback(async (finalScore) => {
    if (gameOverRef.current) return;
    gameOverRef.current = true;
    setGameOver(true);
    if (finalScore > 0) {
      const res = await submitScore("dino", finalScore);
      if (res) setResult(res);
    }
    setShowResult(true);
  }, [submitScore]);

  const jump = useCallback(() => {
    if (gameOverRef.current) return;
    const game = gameRef.current;
    if (!startedRef.current) {
      startGame();
      return;
    }
    if (game.dino.y >= GROUND_Y - DINO_H - 2) {
      game.dino.vy = JUMP_FORCE;
    }
  }, [startGame]);

  const setDuck = useCallback((down) => {
    if (gameOverRef.current) return;
    const game = gameRef.current;
    if (down && game.dino.y >= GROUND_Y - DINO_H - 2) {
      game.ducking = true;
    } else {
      game.ducking = false;
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        if (gameOverRef.current && !showResult) {
          startGame();
        } else if (!gameOverRef.current) {
          jump();
        }
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!gameOverRef.current) setDuck(true);
      }
    };
    const upHandler = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setDuck(false);
      }
    };
    window.addEventListener("keydown", handler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener("keyup", upHandler);
    };
  }, [jump, setDuck, startGame, showResult]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      const game = gameRef.current;

      for (const cloud of game.clouds) {
        drawCloud(ctx, cloud.x, cloud.y);
      }

      drawGround(ctx, game.frame * game.speed);

      const dino = game.dino;
      const dinoH = game.ducking ? 28 : DINO_H;
      drawDino(ctx, dino.x, dino.y + (DINO_H - dinoH), game.ducking, game.frame);

      for (const obs of game.obstacles) {
        if (obs.type === "ptero") {
          drawPtero(ctx, obs, game.frame);
        } else {
          drawCactus(ctx, obs);
        }
      }

      ctx.fillStyle = "#535353";
      ctx.font = "bold 18px 'Courier New', monospace";
      ctx.textAlign = "right";
      ctx.fillText(Math.floor(game.score).toString().padStart(5, "0"), CANVAS_W - 20, 30);
      ctx.textAlign = "left";
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText("HI " + (profile?.high_dino || 0).toString().padStart(5, "0"), 20, 30);
    };

    const update = () => {
      if (gameOverRef.current) return;
      const game = gameRef.current;
      if (!startedRef.current) {
        draw();
        animId = requestAnimationFrame(update);
        return;
      }
      game.frame++;

      const dino = game.dino;
      if (game.ducking) {
        dino.vy += GRAVITY * 0.5;
      } else {
        dino.vy += GRAVITY;
      }
      dino.y += dino.vy;
      if (dino.y > GROUND_Y - DINO_H) {
        dino.y = GROUND_Y - DINO_H;
        dino.vy = 0;
      }

      if (game.frame % 150 === 0) {
        game.speed += 0.3;
      }

      for (const cloud of game.clouds) {
        cloud.x -= game.speed * 0.3;
        if (cloud.x < -30) {
          cloud.x = CANVAS_W + 20;
          cloud.y = 20 + Math.random() * 40;
        }
      }

      const spawnInterval = Math.max(50, 120 - Math.floor(game.speed * 3));
      if (game.frame % spawnInterval === 0) {
        const rand = Math.random();
        if (rand < 0.2 && game.speed > 7) {
          const yPos = PTERO_Y_LEVELS[Math.floor(Math.random() * PTERO_Y_LEVELS.length)];
          game.obstacles.push({
            x: CANVAS_W + 20,
            y: yPos,
            w: PTERO_W,
            h: PTERO_H,
            type: "ptero",
            scale: 1,
          });
        } else {
          const cactType = CACTUS_TYPES[Math.floor(Math.random() * CACTUS_TYPES.length)];
          game.obstacles.push({
            x: CANVAS_W + 20,
            y: GROUND_Y - cactType.h,
            w: cactType.w,
            h: cactType.h,
            type: cactType.type,
            scale: 1,
          });
        }
      }

      game.obstacles = game.obstacles.filter((obs) => {
        obs.x -= game.speed;
        return obs.x > -60;
      });

      const dinoH = game.ducking ? 28 : DINO_H;
      const dinoY = dino.y + (DINO_H - dinoH);
      const dinoW = game.ducking ? 54 : DINO_W;
      for (const obs of game.obstacles) {
        const padX = 4, padY = 4;
        if (
          dino.x + padX < obs.x + obs.w - padX &&
          dino.x + dinoW - padX > obs.x + padX &&
          dinoY + padY < obs.y + obs.h - padY &&
          dinoY + dinoH - padY > obs.y + padY
        ) {
          handleGameEnd(Math.floor(game.score));
          return;
        }
      }

      game.score += 0.1;
      scoreRef.current = Math.floor(game.score);
      setScore(Math.floor(game.score));

      draw();
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [handleGameEnd, profile, gameId]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <div className="game-page">
      <div className="game-header">
        <button onClick={() => navigate("/dashboard")}>← بازگشت</button>
        <h1>دایناسور</h1>
        <div className="game-scores">
          <div className="score-box">امتیاز: {score.toLocaleString("fa-IR")}</div>
          <div className="score-box">بهترین: {(profile?.high_dino || 0).toLocaleString("fa-IR")}</div>
        </div>
      </div>

      <div className="dino-container">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="dino-canvas"
        />
      </div>

      <div className="swipe-hint">Space یا ↑ برای پرش | ↓ برای خم شدن</div>

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
    </div>
  );
}
