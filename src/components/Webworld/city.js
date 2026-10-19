import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

function makeTextTexture(text, { bg = "#334155", fg = "#ffffff", w = 512, h = 128, size = 46 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = `bold ${size}px Tahoma, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, w / 2, h / 2);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function buildingBox(w, h, d, color, x, z) {
  const g = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color }));
  mesh.position.set(x, h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ساخت شهر: زمین بزرگ، میدان اصلی، خیابان‌ها، ساختمان‌های متنوع و دو ساختمان شاخص
// (مدیریت و بازی). برای اضافه کردن ساختمان در آینده، کافی است به لیست `blocks`
// یک قطعه جدید اضافه کنید یا یک `landmark` جدید تعریف کنید.
export default function buildCity(scene) {
  const colliders = []; // برای برخورد آواتار با ساختمان‌ها

  // ---------- زمین ----------
  const WORLD = 320;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD, WORLD),
    new THREE.MeshLambertMaterial({ color: 0x3f7d3a })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // ---------- میدان اصلی (سنگ‌فرش) ----------
  // ضخامت مثل خیابان‌ها (۰.۰۶) است تا کاراکتر داخل آن فرو نرود و همه سطوح هم‌تراز باشند.
  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.06, 60),
    new THREE.MeshLambertMaterial({ color: 0x9aa3ad })
  );
  plaza.position.set(0, 0.03, 0);
  plaza.receiveShadow = true;
  scene.add(plaza);

  // ستون‌های میدان
  for (const [dx, dz] of [[-28, -28], [28, -28], [-28, 28], [28, 28]]) {
    const col = buildingBox(1, 1.5, 1, 0x6b7280, dx, dz);
    scene.add(col);
    colliders.push({ min: { x: dx - 0.5, z: dz - 0.5 }, max: { x: dx + 0.5, z: dz + 0.5 } });
  }

  // ---------- آبنما وسط میدان ----------
  // مدل سه‌بعدی fountain_model.glb جایگزین فواره قبلی می‌شود. کولایدر هم‌زمان (هم‌گام)
  // اضافه می‌شود تا کاراکتر حتی قبل از بارگذاری مدل هم نتواند از آن رد شود.
  const halfFoot = 3.4; // نیمی از پهنای پای مدل برای کولایدر مربعی
  colliders.push({ min: { x: -halfFoot, z: -halfFoot }, max: { x: halfFoot, z: halfFoot } });

  const fountainLoader = new GLTFLoader();
  fountainLoader.load(
    "/3d Objects/fountain_model.glb",
    (gltf) => {
      const model = gltf.scene;
      // مدل تقریباً ۶.۵ واحد عرض و ۰.۷۳ ارتفاع دارد؛ بدون تغییر مقیاس، اندازه مناسب است.
      // پای مدل در y=-0.25 است؛ آن را بالا می‌بریم تا دقیقاً روی سطح میدان (y=0.06) بنشیند.
      model.position.set(0, 0.06 - -0.25, 0);
      model.castShadow = true;
      scene.add(model);
    },
    undefined,
    (err) => {
      console.error("[city] بارگذاری fountain_model.glb ناموفق بود:", err);
    }
  );

  // ---------- خیابان‌ها ----------
  // جاده‌ها به دو تکه شکسته شده‌اند تا از میدان عبور نکنند و z-fighting نداشته باشیم.
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x4b5563 });
  const roadLen = WORLD / 2 - 30;
  const roadH1 = new THREE.Mesh(new THREE.BoxGeometry(roadLen, 0.06, 10), roadMat);
  roadH1.position.set(-30 - roadLen / 2, 0.03, 0);
  roadH1.receiveShadow = true;
  scene.add(roadH1);
  const roadH2 = new THREE.Mesh(new THREE.BoxGeometry(roadLen, 0.06, 10), roadMat);
  roadH2.position.set(30 + roadLen / 2, 0.03, 0);
  roadH2.receiveShadow = true;
  scene.add(roadH2);
  const roadV1 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.06, roadLen), roadMat);
  roadV1.position.set(0, 0.03, -30 - roadLen / 2);
  roadV1.receiveShadow = true;
  scene.add(roadV1);
  const roadV2 = new THREE.Mesh(new THREE.BoxGeometry(10, 0.06, roadLen), roadMat);
  roadV2.position.set(0, 0.03, 30 + roadLen / 2);
  roadV2.receiveShadow = true;
  scene.add(roadV2);

  // ---------- ساختمان مدیریت ----------
  const mgmtX = 0;
  const mgmtZ = -45;
  const mgmtW = 20;
  const mgmtD = 16;
  const mgmtH = 2;
  const mgmtMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
  const mgmt = new THREE.Mesh(new THREE.BoxGeometry(mgmtW, mgmtH, mgmtD), mgmtMat);
  mgmt.position.set(mgmtX, mgmtH / 2, mgmtZ);
  mgmt.castShadow = true;
  mgmt.receiveShadow = true;
  scene.add(mgmt);
  const mgmtRoof = new THREE.Mesh(
    new THREE.BoxGeometry(mgmtW + 0.6, 0.25, mgmtD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x1e3a8a })
  );
  mgmtRoof.position.set(mgmtX, mgmtH + 0.125, mgmtZ);
  scene.add(mgmtRoof);

  const signMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان مدیریت", { bg: "#1d4ed8", fg: "#ffffff" }),
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.875), signMat);
  sign.position.set(mgmtX, mgmtH + 0.5, mgmtZ);
  scene.add(sign);

  colliders.push({
    min: { x: mgmtX - mgmtW / 2, z: mgmtZ - mgmtD / 2 },
    max: { x: mgmtX + mgmtW / 2, z: mgmtZ + mgmtD / 2 },
  });
  const managementZone = { x: mgmtX, z: mgmtZ + mgmtD / 2 + 5, r: 6 };

  const mgmtDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به مدیریت", { bg: "#3b82f6", fg: "#ffffff", w: 512, h: 640, size: 52 }) });
  const mgmtDoor = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.625), mgmtDoorMat);
  mgmtDoor.position.set(mgmtX, 1, mgmtZ + mgmtD / 2 + 0.02);
  scene.add(mgmtDoor);
  const mgmtDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("مدیریت", { bg: "#1d4ed8", fg: "#ffffff", w: 256, h: 64, size: 28 }) });
  const mgmtDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.2), mgmtDoorSignMat);
  mgmtDoorSign.position.set(mgmtX, 1.875, mgmtZ + mgmtD / 2 + 0.02);
  scene.add(mgmtDoorSign);

  // ---------- ساختمان بازی ----------
  const gameX = 0;
  const gameZ = 45;
  const gameW = 22;
  const gameD = 18;
  const gameH = 1.75;
  const gameMat = new THREE.MeshLambertMaterial({ color: 0x0f766e });
  const gameB = new THREE.Mesh(new THREE.BoxGeometry(gameW, gameH, gameD), gameMat);
  gameB.position.set(gameX, gameH / 2, gameZ);
  gameB.castShadow = true;
  gameB.receiveShadow = true;
  scene.add(gameB);
  const gameRoof = new THREE.Mesh(
    new THREE.BoxGeometry(gameW + 0.6, 0.25, gameD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x115e59 })
  );
  gameRoof.position.set(gameX, gameH + 0.125, gameZ);
  scene.add(gameRoof);

  const gameSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان بازی", { bg: "#0f766e", fg: "#ffffff" }),
  });
  const gameSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.875), gameSignMat);
  gameSign.position.set(gameX, gameH + 0.5, gameZ);
  scene.add(gameSign);

  colliders.push({
    min: { x: gameX - gameW / 2, z: gameZ - gameD / 2 },
    max: { x: gameX + gameW / 2, z: gameZ + gameD / 2 },
  });
  const gamesZone = { x: gameX, z: gameZ - gameD / 2 - 5, r: 6 };

  const gameDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به بازی", { bg: "#14b8a6", fg: "#ffffff", w: 512, h: 640, size: 52 }) });
  const gameDoor = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.625), gameDoorMat);
  gameDoor.position.set(gameX, 1, gameZ - gameD / 2 - 0.02);
  scene.add(gameDoor);
  const gameDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("بازی", { bg: "#0f766e", fg: "#ffffff", w: 256, h: 64, size: 28 }) });
  const gameDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.2), gameDoorSignMat);
  gameDoorSign.position.set(gameX, 1.875, gameZ - gameD / 2 - 0.02);
  scene.add(gameDoorSign);

  // ---------- ساختمان مدرسه (شاد) ----------
  const schX = 55;
  const schZ = 55;
  const schW = 20;
  const schD = 16;
  const schH = 1.5;
  const schBody = new THREE.Mesh(
    new THREE.BoxGeometry(schW, schH, schD),
    new THREE.MeshLambertMaterial({ color: 0x2563eb })
  );
  schBody.position.set(schX, schH / 2, schZ);
  schBody.castShadow = true;
  schBody.receiveShadow = true;
  scene.add(schBody);
  const schRoof = new THREE.Mesh(
    new THREE.BoxGeometry(schW + 0.6, 0.25, schD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x1e40af })
  );
  schRoof.position.set(schX, schH + 0.125, schZ);
  scene.add(schRoof);
  const schSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان مدرسه (شاد)", { bg: "#2563eb", fg: "#ffffff" }),
  });
  const schSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.875), schSignMat);
  schSign.position.set(schX, schH + 0.5, schZ);
  scene.add(schSign);
  colliders.push({
    min: { x: schX - schW / 2, z: schZ - schD / 2 },
    max: { x: schX + schW / 2, z: schZ + schD / 2 },
  });
  const schoolZone = { x: schX - schW / 2 - 5, z: schZ, r: 7 };

  const schDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به شاد", { bg: "#60a5fa", fg: "#ffffff", w: 512, h: 640, size: 52 }) });
  const schDoor = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.5), schDoorMat);
  schDoor.rotation.y = Math.PI / 2;
  schDoor.position.set(schX - schW / 2 - 0.02, 0.875, schZ);
  scene.add(schDoor);
  const schDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("شاد", { bg: "#2563eb", fg: "#ffffff", w: 256, h: 64, size: 28 }) });
  const schDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.2), schDoorSignMat);
  schDoorSign.rotation.y = Math.PI / 2;
  schDoorSign.position.set(schX - schW / 2 - 0.02, 1.75, schZ);
  scene.add(schDoorSign);

  // ---------- ساختمان موزه ----------
  const musX = -55;
  const musZ = 55;
  const musW = 22;
  const musD = 16;
  const musH = 1.25;
  const musBody = new THREE.Mesh(
    new THREE.BoxGeometry(musW, musH, musD),
    new THREE.MeshLambertMaterial({ color: 0x92400e })
  );
  musBody.position.set(musX, musH / 2, musZ);
  musBody.castShadow = true;
  musBody.receiveShadow = true;
  scene.add(musBody);
  const musRoof = new THREE.Mesh(
    new THREE.BoxGeometry(musW + 0.6, 0.25, musD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x78350f })
  );
  musRoof.position.set(musX, musH + 0.125, musZ);
  scene.add(musRoof);
  const musSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("موزه ملی", { bg: "#92400e", fg: "#ffffff" }),
  });
  const musSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.875), musSignMat);
  musSign.position.set(musX, musH + 0.5, musZ);
  scene.add(musSign);
  colliders.push({
    min: { x: musX - musW / 2, z: musZ - musD / 2 },
    max: { x: musX + musW / 2, z: musZ + musD / 2 },
  });
  const museumZone = { x: musX + musW / 2 + 5, z: musZ, r: 7 };

  const musDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به موزه", { bg: "#f59e0b", fg: "#ffffff", w: 512, h: 640, size: 52 }) });
  const musDoor = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 1.375), musDoorMat);
  musDoor.rotation.y = -Math.PI / 2;
  musDoor.position.set(musX + musW / 2 + 0.02, 0.75, musZ);
  scene.add(musDoor);
  const musDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("موزه", { bg: "#92400e", fg: "#ffffff", w: 256, h: 64, size: 28 }) });
  const musDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.2), musDoorSignMat);
  musDoorSign.rotation.y = -Math.PI / 2;
  musDoorSign.position.set(musX + musW / 2 + 0.02, 1.575, musZ);
  scene.add(musDoorSign);

  // ---------- ساختمان خرید ----------
  const shpX = 55;
  const shpZ = -55;
  const shpW = 18;
  const shpD = 16;
  const shpH = 1.5;
  const shpBody = new THREE.Mesh(
    new THREE.BoxGeometry(shpW, shpH, shpD),
    new THREE.MeshLambertMaterial({ color: 0xbe185d })
  );
  shpBody.position.set(shpX, shpH / 2, shpZ);
  shpBody.castShadow = true;
  shpBody.receiveShadow = true;
  scene.add(shpBody);
  const shpRoof = new THREE.Mesh(
    new THREE.BoxGeometry(shpW + 0.6, 0.25, shpD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x9d174d })
  );
  shpRoof.position.set(shpX, shpH + 0.125, shpZ);
  scene.add(shpRoof);
  const shpSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان خرید", { bg: "#be185d", fg: "#ffffff" }),
  });
  const shpSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.875), shpSignMat);
  shpSign.position.set(shpX, shpH + 0.5, shpZ);
  scene.add(shpSign);
  colliders.push({
    min: { x: shpX - shpW / 2, z: shpZ - shpD / 2 },
    max: { x: shpX + shpW / 2, z: shpZ + shpD / 2 },
  });
  const shopZone = { x: shpX - shpW / 2 - 5, z: shpZ, r: 7 };

  const shpDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به فروشگاه", { bg: "#f472b6", fg: "#ffffff", w: 512, h: 640, size: 48 }) });
  const shpDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 1.375), shpDoorMat);
  shpDoor.rotation.y = Math.PI / 2;
  shpDoor.position.set(shpX - shpW / 2 - 0.02, 0.875, shpZ);
  scene.add(shpDoor);
  const shpDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("فروشگاه", { bg: "#be185d", fg: "#ffffff", w: 256, h: 64, size: 28 }) });
  const shpDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.2), shpDoorSignMat);
  shpDoorSign.rotation.y = Math.PI / 2;
  shpDoorSign.position.set(shpX - shpW / 2 - 0.02, 1.75, shpZ);
  scene.add(shpDoorSign);

  // ---------- درخت‌ها و چراغ‌ها ----------
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6b4226 });
  const leafMat = new THREE.MeshLambertMaterial({ color: 0x2f9e44 });
  for (let i = 0; i < 60; i++) {
    const tx = (Math.random() - 0.5) * 260;
    const tz = (Math.random() - 0.5) * 260;
    if (Math.abs(tx) < 35 && Math.abs(tz) < 35) continue; // دور از میدان
    if (Math.abs(tx) < 6 || Math.abs(tz) < 6) continue; // دور از خیابان
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2, 8), trunkMat);
    t.position.set(tx, 1, tz);
    const lf = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2, 1), leafMat);
    lf.position.set(tx, 3.6, tz);
    scene.add(t, lf);
  }

  return { colliders, managementZone, gamesZone, schoolZone, museumZone, shopZone, spawn: { x: 0, z: 22 } };
}
