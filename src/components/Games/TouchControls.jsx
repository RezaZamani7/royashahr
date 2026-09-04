export function Dpad({ onDirection, size = "normal" }) {
  const btnSize = size === "small" ? "small" : "";

  const handleDir = (dir) => {
    if (onDirection) onDirection(dir);
  };

  return (
    <div className={`dpad ${btnSize}`}>
      <div className="dpad-btn empty dpad-top-left"></div>
      <div className="dpad-btn dpad-up" onClick={() => handleDir("up")}>↑</div>
      <div className="dpad-btn empty dpad-top-right"></div>

      <div className="dpad-btn dpad-left" onClick={() => handleDir("left")}>←</div>
      <div className="dpad-btn empty dpad-center"></div>
      <div className="dpad-btn dpad-right" onClick={() => handleDir("right")}>→</div>

      <div className="dpad-btn empty dpad-bottom-left"></div>
      <div className="dpad-btn dpad-down" onClick={() => handleDir("down")}>↓</div>
      <div className="dpad-btn empty dpad-bottom-right"></div>
    </div>
  );
}

export default function TouchControls({ type, onDirection, onAction, onActionEnd, gameOver, onRestart }) {
  const handlePressStart = (action) => {
    if (onAction) onAction(action);
  };

  const handlePressEnd = (action) => {
    if (onActionEnd) onActionEnd(action);
  };

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
          <div className="touch-left">
            <button className="action-btn snake-action-btn" onClick={() => handlePressStart("pause")}>
              ⏸️
            </button>
          </div>
          <div className="touch-right">
            <Dpad onDirection={onDirection} />
          </div>
        </div>
      );

    case "dino":
      return (
        <div className="touch-controls dino-touch-controls">
          <div className="touch-left">
            <button
              className="action-btn dino-btn duck"
              onMouseDown={() => handlePressStart("duck_start")}
              onMouseUp={() => handlePressEnd("duck_start")}
              onTouchStart={(e) => { e.preventDefault(); handlePressStart("duck_start"); }}
              onTouchEnd={(e) => { e.preventDefault(); handlePressEnd("duck_start"); }}
            >
              خم شدن
            </button>
          </div>
          <div className="touch-right">
            <button className="action-btn dino-btn jump" onClick={() => handlePressStart("jump")}>
              پرش
            </button>
          </div>
        </div>
      );

    case "tetris":
      return (
        <div className="touch-controls tetris-touch-controls">
          <div className="touch-left">
            <button className="action-btn rotate" onClick={() => handlePressStart("rotate")}>
              ↻
            </button>
            <button className="action-btn drop" onClick={() => handlePressStart("drop")}>
              ⬇
            </button>
          </div>
          <div className="touch-right">
            <Dpad onDirection={onDirection} size="small" />
          </div>
        </div>
      );

    case "game2048":
      return (
        <div className="touch-controls game2048-touch-controls">
          <div className="touch-left">
            <div style={{ width: "52px", height: "52px" }} />
          </div>
          <div className="touch-right">
            <Dpad onDirection={onDirection} />
          </div>
        </div>
      );

    default:
      return null;
  }
}
