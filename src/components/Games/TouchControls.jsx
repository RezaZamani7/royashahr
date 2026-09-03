export function Dpad({ onDirection, size = "normal" }) {
  const btnSize = size === "small" ? "small" : "";

  const handleDir = (dir) => {
    if (onDirection) onDirection(dir);
  };

  return (
    <div className={`dpad ${btnSize}`}>
      <div className="dpad-btn empty"></div>
      <div className="dpad-btn" onClick={() => handleDir("up")}>↑</div>
      <div className="dpad-btn empty"></div>

      <div className="dpad-btn" onClick={() => handleDir("left")}>←</div>
      <div className="dpad-btn empty"></div>
      <div className="dpad-btn" onClick={() => handleDir("right")}>→</div>

      <div className="dpad-btn empty"></div>
      <div className="dpad-btn" onClick={() => handleDir("down")}>↓</div>
      <div className="dpad-btn empty"></div>
    </div>
  );
}

export default function TouchControls({ type, onDirection, onAction, gameOver, onRestart }) {
  if (gameOver && type === "snake") {
    return (
      <div className="touch-controls">
        <button className="action-btn snake-action-btn" onClick={onRestart}>
          🎮
        </button>
      </div>
    );
  }

  if (gameOver && type === "tetris") {
    return (
      <div className="touch-controls">
        <button className="action-btn rotate" onClick={onRestart} style={{ fontSize: "1.4rem" }}>
          ↻
        </button>
      </div>
    );
  }

  if (gameOver) {
    return null;
  }

  switch (type) {
    case "snake":
      return (
        <div className="touch-controls snake-touch-controls">
          <Dpad onDirection={onDirection} />
          <button className="action-btn snake-action-btn" onClick={() => onAction("pause")}>
            ⏸️
          </button>
        </div>
      );

    case "dino":
      return (
        <div className="touch-controls dino-touch-controls">
          <button className="action-btn dino-btn jump" onClick={() => onAction("jump")}>
            پرش
          </button>
          <button className="action-btn dino-btn duck" onClick={() => onAction("duck")}>
            خم شدن
          </button>
        </div>
      );

    case "tetris":
      return (
        <div className="touch-controls tetris-touch-controls">
          <Dpad onDirection={onDirection} size="small" />
          <button className="action-btn rotate" onClick={() => onAction("rotate")}>
            ↻
          </button>
          <button className="action-btn drop" onClick={() => onAction("drop")}>
            ⬇
          </button>
        </div>
      );

    case "game2048":
      return (
        <div className="touch-controls game2048-touch-controls">
          <Dpad onDirection={onDirection} />
        </div>
      );

    default:
      return null;
  }
}
