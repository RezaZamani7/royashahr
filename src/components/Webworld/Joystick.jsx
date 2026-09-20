import { useRef } from "react";

// جوی‌استیک مجازی برای موبایل/تبلت. موقعیت انگشت را نسبت به مرکز ناحیه لمس
// به بردار حرکت (nx, ny) در بازه [-1, 1] تبدیل می‌کند.
export default function Joystick({ onMove, size = 120 }) {
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  const activeId = useRef(null);
  const baseCenter = useRef({ x: 0, y: 0 });

  const setCenter = () => {
    const el = baseRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    baseCenter.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const update = (clientX, clientY) => {
    const { x, y } = baseCenter.current;
    let dx = clientX - x;
    let dy = clientY - y;
    const max = size / 2 - 20;
    const len = Math.hypot(dx, dy);
    if (len > max) {
      dx = (dx / len) * max;
      dy = (dy / len) * max;
    }
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }
    onMove(dx / max, dy / max);
  };

  const start = (e) => {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    activeId.current = e.touches ? e.touches[0].identifier : null;
    setCenter();
    update(pt.clientX, pt.clientY);
  };

  const move = (e) => {
    e.preventDefault();
    if (!activeId.current && !e.touches) return;
    const t = Array.from(e.touches).find((t) => t.identifier === activeId.current);
    if (!t) return;
    update(t.clientX, t.clientY);
  };

  const end = (e) => {
    e.preventDefault();
    if (e.changedTouches && activeId.current !== null) {
      const t = Array.from(e.changedTouches).find((t) => t.identifier === activeId.current);
      if (!t) return;
    }
    activeId.current = null;
    if (knobRef.current) knobRef.current.style.transform = "translate(0px, 0px)";
    onMove(0, 0);
  };

  return (
    <div
      className="joystick-base"
      ref={baseRef}
      style={{ width: size, height: size }}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
    >
      <div className="joystick-knob" ref={knobRef} />
    </div>
  );
}
