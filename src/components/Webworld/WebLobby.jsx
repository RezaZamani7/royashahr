import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGame } from "../../context/GameContext";
import { useNavigate } from "react-router-dom";
import buildCity from "./city";
import { loadAvatarWithAnimation, AVAATARS } from "./avatars";
import Joystick from "./Joystick";
import AvatarPicker from "./AvatarPicker";
import BrowserModal from "./BrowserModal";

const SPEED = 7;
const PLAYER_RADIUS = 0.5;
const WORLD_HALF = 150;

export default function WebLobby() {
  const { profile, updateAvatar } = useGame();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const avatarGroupRef = useRef(null);

  const inputRef = useRef({ keys: new Set(), joy: { x: 0, z: 0 } });
  const camModeRef = useRef("third"); // "third" | "first"
  const actionRef = useRef(null);

  const [camMode, setCamMode] = useState("third");
  const [action, setAction] = useState(null); // {type:'management'} | {type:'games'}
  const [browser, setBrowser] = useState(null); // {title, src}
  const [showPicker, setShowPicker] = useState(false);
  const [avatarId, setAvatarId] = useState(profile?.avatar || AVAATARS[0].id);

  const updateAvatarState = useCallback(
    async (id) => {
      setAvatarId(id);
      await updateAvatar(id);
      setShowPicker(false);
    },
    [updateAvatar]
  );

  // مدیریت ورودی جوی‌استیک
  const handleJoy = useCallback((dx, dy) => {
    // dy از بالا به پایین مثبت است؛ map به Z: پایین یعنی -Z
    inputRef.current.joy = { x: dx, z: -dy };
  }, []);

  // ---------- هسته‌ی سه‌بعدی ----------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 120, 320);

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
    camera.position.set(0, 22, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // نور
    const hemi = new THREE.HemisphereLight(0xffffff, 0x3a5a2a, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(80, 120, 60);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -160;
    sun.shadow.camera.right = 160;
    sun.shadow.camera.top = 160;
    sun.shadow.camera.bottom = -160;
    scene.add(sun);

    // شهر
    const city = buildCity(scene);

    // آواتار به صورت غیرهمزمان از فایل GLB بارگذاری می‌شود.
    let player = null;
    let avatarControllerRef = null;
    let modelDisposed = false;

    (async () => {
      try {
        const attrs = await loadAvatarWithAnimation(avatarId);
        if (modelDisposed) return;
        player = attrs.model;
        avatarControllerRef = attrs.controller;
        player.position.set(city.spawn.x, 0, city.spawn.z);
        avatarGroupRef.current = player;
        scene.add(player);
        if (avatarControllerRef) avatarControllerRef.setState("idle");
      } catch (e) {
        console.error("[WebLobby] بارگذاری آواتار ناموفق بود:", e);
      }
    })();

    // مدیریت resize (موبایل/تبلت)
    const resize = () => {
      const w = container.clientWidth || 1;
      const h = container.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    // ورودی صفحه‌کلید
    let jumpUntil = 0;
    const down = (e) => {
      inputRef.current.keys.add(e.key);
      if ((e.key === " " || e.key === "Spacebar") && jumpUntil < clock.getElapsedTime()) {
        jumpUntil = clock.getElapsedTime() + 0.7;
      }
    };
    const up = (e) => inputRef.current.keys.delete(e.key);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    const clock = new THREE.Clock();
    clock.start();
    let raf;
    const camPos = new THREE.Vector3();
    const collidePoint = new THREE.Vector3();

    const collide = (x, z) => {
      for (const c of city.colliders) {
        if (
          x + PLAYER_RADIUS > c.min.x &&
          x - PLAYER_RADIUS < c.max.x &&
          z + PLAYER_RADIUS > c.min.z &&
          z - PLAYER_RADIUS < c.max.z
        ) {
          const penX = Math.min(x + PLAYER_RADIUS - c.min.x, c.max.x - (x - PLAYER_RADIUS));
          const penZ = Math.min(z + PLAYER_RADIUS - c.min.z, c.max.z - (z - PLAYER_RADIUS));
          return penX < penZ ? { axis: "x", penX } : { axis: "z", penZ };
        }
      }
      return null;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 0.05);
      const keys = inputRef.current.keys;
      const joy = inputRef.current.joy;

      let ix = joy.x;
      let iz = joy.z;
      if (keys.has("w") || keys.has("ArrowUp")) iz += 1;
      if (keys.has("s") || keys.has("ArrowDown")) iz -= 1;
      if (keys.has("a") || keys.has("ArrowLeft")) ix -= 1;
      if (keys.has("d") || keys.has("ArrowRight")) ix += 1;

      if (!player) return;

      let len = Math.hypot(ix, iz);
      const moving = len > 0;
      const now = clock.getElapsedTime();
      const jumping = jumpUntil > now;
      if (moving) {
        ix /= len;
        iz /= len;
        const moveAngle = Math.atan2(ix, iz);
        let nx = player.position.x + ix * SPEED * dt;
        let nz = player.position.z + iz * SPEED * dt;
        nx = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, nx));
        nz = Math.max(-WORLD_HALF, Math.min(WORLD_HALF, nz));
        const col = collide(nx, nz);
        if (!col) {
          player.position.x = nx;
          player.position.z = nz;
        } else if (col.axis === "x") {
          if (col.penX > 0) player.position.x = ix > 0 ? nx - col.penX : nx + col.penX;
          player.position.z = nz;
        } else {
          player.position.x = nx;
          player.position.z = iz > 0 ? nz - col.penZ : nz + col.penZ;
        }
        // جهت محلی چهره‌ی کاراکتر -Z است؛ پس برای هم‌جهت شدن با حرکت باید π چرخانده شود
        const targetRot = moveAngle + Math.PI;
        let cur = player.rotation.y;
        let diff = targetRot - cur;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        player.rotation.y = cur + diff * Math.min(1, dt * 14);
      }

      // انتخاب حالت انیمیشن از طریق AnimationMixer با انتقال نرم
      if (jumping) avatarControllerRef?.setState("jump");
      else if (moving) avatarControllerRef?.setState(len > 0.6 ? "run" : "walk");
      else avatarControllerRef?.setState("idle");
      if (avatarControllerRef) avatarControllerRef.update(dt);

      const px = player.position.x;
      const pz = player.position.z;
      let newAction = null;
      if (Math.hypot(px - city.managementZone.x, pz - city.managementZone.z) < city.managementZone.r) {
        newAction = { type: "management" };
      } else if (Math.hypot(px - city.gamesZone.x, pz - city.gamesZone.z) < city.gamesZone.r) {
        newAction = { type: "games" };
      }
      if ((newAction?.type) !== (actionRef.current?.type)) {
        actionRef.current = newAction;
        setAction(newAction);
      }

      // جهت رو به روی کاراکتر (با توجه به اینکه محلی چهره -Z است)
      const fwdX = -Math.sin(player.rotation.y);
      const fwdZ = -Math.cos(player.rotation.y);
      if (camModeRef.current === "first") {
        camPos.set(player.position.x, 1.45, player.position.z);
        camera.position.copy(camPos);
        camera.lookAt(player.position.x + fwdX * 10, 1.3, player.position.z + fwdZ * 10);
      } else {
        // دوربین پشت کاراکتر و هم‌زمان با چرخش او حرکت می‌کند
        const dist = 7;
        const height = 3.8;
        camPos.set(
          player.position.x - fwdX * dist,
          height,
          player.position.z - fwdZ * dist
        );
        camera.position.copy(camPos);
        camera.lookAt(player.position.x, 1.2, player.position.z);
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      modelDisposed = true;
      if (player) {
        if (avatarControllerRef) avatarControllerRef.mixer.stopAllAction();
        player.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) {
            if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
            else o.material.dispose();
          }
        });
        scene.remove(player);
      }
      scene.traverse((o) => {
        if (o.geometry && o !== player && !o.userData) o.geometry.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avatarId]);

  const toggleCam = () => {
    const next = camModeRef.current === "third" ? "first" : "third";
    camModeRef.current = next;
    setCamMode(next);
  };

  const openManagement = (page) => {
    const pages = {
      profile: { title: "تنظیمات پروفایل", src: "/dashboard" },
      ticket: { title: "تیکت پشتیبانی", src: "/support" },
      email: { title: "ارسال ایمیل", src: "/email" },
    };
    const p = pages[page];
    setBrowser(p);
  };

  const openGames = () => {
    setBrowser({ title: "لیست بازی‌ها", src: "/games" });
  };

  return (
    <div className="weblobby">
      <div className="world-canvas" ref={containerRef} />

      {/* هدر ثبت‌نام/خروج */}
      <div className="world-topbar">
        <div className="world-brand">رویاشهر</div>
        <div className="world-topbar-actions">
          <button className="world-btn" onClick={() => navigate("/dashboard")}>داشبورد</button>
          <button className="world-btn" onClick={() => setShowPicker(true)}>
            آواتار: {profile?.avatar ? AVAATARS.find((a) => a.id === avatarId)?.label : "انتخاب"}
          </button>
          <button className="world-btn" onClick={toggleCam}>
            {camMode === "third" ? "📷 اول شخص" : "📷 سوم شخص"}
          </button>
        </div>
      </div>

      {/* راهنمای حرکت */}
      <div className="world-hint">
        <span>جهت‌نما / WASD برای حرکت</span>
        <span>به سمت ساختمان‌ها بروید</span>
      </div>

      {/* جوی‌استیک موبایل */}
      <div className="world-joystick">
        <Joystick onMove={handleJoy} />
      </div>

      {/* نشانگر تعامل: دربavorite ساختمان */}
      {action && !browser && (
        <div className="world-action">
          {action.type === "management" && (
            <>
              <p className="world-action-title">ساختمان مدیریت</p>
              <div className="world-action-btns">
                <button className="world-enter-btn" onClick={() => openManagement("profile")}>
                  تنظیمات پروفایل
                </button>
                <button className="world-enter-btn" onClick={() => openManagement("ticket")}>
                  تیکت پشتیبانی
                </button>
                <button className="world-enter-btn" onClick={() => openManagement("email")}>
                  ارسال ایمیل
                </button>
              </div>
            </>
          )}
          {action.type === "games" && (
            <>
              <p className="world-action-title">ساختمان بازی</p>
              <button className="world-enter-btn" onClick={openGames}>
                ورود به ساختمان بازی
              </button>
            </>
          )}
        </div>
      )}

      {showPicker && (
        <AvatarPicker
          currentId={avatarId}
          onSelect={updateAvatarState}
          onClose={() => setShowPicker(false)}
        />
      )}

      {browser && <BrowserModal title={browser.title} src={browser.src} onClose={() => setBrowser(null)} />}
    </div>
  );
}
