import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AVAATARS, loadAvatar } from "./avatars";

// پیش‌نمایش آواتارها: هر مدل GLB یک‌بار بارگذاری می‌شود، در یک canvas مشترک رندر شده
// و به تصویر (data URL) تبدیل می‌شود تا بدون ایجاد چند context سه‌بعدی نمایش داده شود.
async function renderAvatarToDataUrl(id) {
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

  const avatar = await loadAvatar(id);
  avatar.position.y = 0;
  scene.add(avatar);
  avatar.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(avatar);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const dist = (maxDim / 2 / Math.tan((45 * Math.PI) / 360)) * 1.15;
  camera.position.set(center.x, center.y, center.z + dist);
  camera.lookAt(center.x, center.y, center.z);

  renderer.render(scene, camera);
  const dataUrl = canvas.toDataURL("image/png");
  avatar.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
      else o.material.dispose();
    }
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
    let cancelled = false;
    const ids = AVAATARS.map((a) => a.id);
    Promise.all(
      ids.map((id) =>
        renderAvatarToDataUrl(id).then((url) => ({ id, url }))
      )
    )
      .then((results) => {
        if (cancelled) return;
        const map = {};
        for (const r of results) map[r.id] = r.url;
        setPreviews(map);
      })
      .catch((e) => console.error("[AvatarPicker] بارگذاری پیش‌نمایش ناموفق بود:", e));
    return () => {
      cancelled = true;
    };
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
