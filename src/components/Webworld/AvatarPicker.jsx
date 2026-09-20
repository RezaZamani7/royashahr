import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AVAATARS } from "./avatars";

// پیش‌نمایش آواتارها: هر آواتار یک‌بار در یک canvas مشترک رندر و به تصویر
// (data URL) تبدیل می‌شود تا بدون ایجاد چند context سه‌بعدی، تصویر نمایش داده شود.
function renderAvatarToDataUrl(build) {
  const canvas = document.createElement("canvas");
  canvas.width = 240;
  canvas.height = 320;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setClearColor(0x0b1220, 1);

  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(2, 3, 4);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(45, 240 / 320, 0.1, 100);
  camera.position.set(0, 1.2, 3.2);
  camera.lookAt(0, 0.9, 0);

  const avatar = build();
  avatar.position.y = 0;
  scene.add(avatar);
  renderer.render(scene, camera);
  const dataUrl = canvas.toDataURL("image/png");
  avatar.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) o.material.dispose();
  });
  renderer.dispose();
  return dataUrl;
}

export default function AvatarPicker({ currentId, onSelect, onClose }) {
  const [previews, setPreviews] = useState({});
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const map = {};
    for (const a of AVAATARS) {
      map[a.id] = renderAvatarToDataUrl(a.build);
    }
    setPreviews(map);
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal avatar-picker-modal" onClick={(e) => e.stopPropagation()}>
        <h2>انتخاب آواتار</h2>
        <div className="avatar-picker-grid">
          {AVAATARS.map((a) => (
            <button
              key={a.id}
              className={`avatar-card ${currentId === a.id ? "selected" : ""}`}
              onClick={() => onSelect(a.id)}
            >
              {previews[a.id] ? (
                <img src={previews[a.id]} alt={a.label} className="avatar-preview" />
              ) : (
                <div className="avatar-preview-loading">…</div>
              )}
              <span className="avatar-label">{a.label}</span>
              {currentId === a.id && <span className="avatar-check">✓ انتخاب شده</span>}
            </button>
          ))}
        </div>
        <button className="close-btn" onClick={onClose}>بستن</button>
      </div>
    </div>
  );
}
