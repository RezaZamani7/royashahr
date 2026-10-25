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
    const col = buildingBox(1, 3, 1, 0x6b7280, dx, dz);
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
  const mgmtW = 10;
  const mgmtD = 8;
  const mgmtH = 4;
  const mgmtMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
  const mgmt = new THREE.Mesh(new THREE.BoxGeometry(mgmtW, mgmtH, mgmtD), mgmtMat);
  mgmt.position.set(mgmtX, mgmtH / 2, mgmtZ);
  mgmt.castShadow = true;
  mgmt.receiveShadow = true;
  scene.add(mgmt);
  const mgmtRoof = new THREE.Mesh(
    new THREE.BoxGeometry(mgmtW + 0.6, 0.5, mgmtD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x1e3a8a })
  );
  mgmtRoof.position.set(mgmtX, mgmtH + 0.25, mgmtZ);
  scene.add(mgmtRoof);

  colliders.push({
    min: { x: mgmtX - mgmtW / 2, z: mgmtZ - mgmtD / 2 },
    max: { x: mgmtX + mgmtW / 2, z: mgmtZ + mgmtD / 2 },
  });
  const managementZone = { x: mgmtX, z: mgmtZ + mgmtD / 2 + 5, r: 6 };

  const mgmtDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به مدیریت", { bg: "#3b82f6", fg: "#ffffff", w: 512, h: 640, size: 52 }), side: THREE.DoubleSide });
  const mgmtDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), mgmtDoorMat);
  mgmtDoor.position.set(mgmtX, 1.5, mgmtZ + mgmtD / 2 + 0.02);
  scene.add(mgmtDoor);
  const mgmtDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("مدیریت", { bg: "#1d4ed8", fg: "#ffffff", w: 256, h: 64, size: 28 }), side: THREE.DoubleSide });
  const mgmtDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.5), mgmtDoorSignMat);
  mgmtDoorSign.position.set(mgmtX, 3.4, mgmtZ + mgmtD / 2 + 0.02);
  scene.add(mgmtDoorSign);

  // ---------- سازمان املاک و اسناد رویاشهر ----------
  const emlX = -20;
  const emlZ = -45;
  const emlW = 10;
  const emlD = 8;
  const emlH = 4;
  const emlBody = new THREE.Mesh(
    new THREE.BoxGeometry(emlW, emlH, emlD),
    new THREE.MeshLambertMaterial({ color: 0x475569 })
  );
  emlBody.position.set(emlX, emlH / 2, emlZ);
  emlBody.castShadow = true;
  emlBody.receiveShadow = true;
  scene.add(emlBody);
  const emlRoof = new THREE.Mesh(
    new THREE.BoxGeometry(emlW + 0.6, 0.5, emlD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x334155 })
  );
  emlRoof.position.set(emlX, emlH + 0.25, emlZ);
  scene.add(emlRoof);
  const emlDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("سازمان املاک", { bg: "#64748b", fg: "#ffffff", w: 512, h: 640, size: 46 }), side: THREE.DoubleSide });
  const emlDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), emlDoorMat);
  emlDoor.position.set(emlX, 1.5, emlZ + emlD / 2 + 0.02);
  scene.add(emlDoor);
  const emlDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("سازمان املاک و اسناد", { bg: "#475569", fg: "#ffffff", w: 512, h: 128, size: 34 }), side: THREE.DoubleSide });
  const emlDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.8), emlDoorSignMat);
  emlDoorSign.position.set(emlX, 3.4, emlZ + emlD / 2 + 0.02);
  scene.add(emlDoorSign);
  colliders.push({
    min: { x: emlX - emlW / 2, z: emlZ - emlD / 2 },
    max: { x: emlX + emlW / 2, z: emlZ + emlD / 2 },
  });
  const realEstateZone = { x: emlX, z: emlZ + emlD / 2 + 5, r: 6 };

  // ---------- مرکز مبادله ارز ----------
  const arzX = 20;
  const arzZ = -45;
  const arzW = 10;
  const arzD = 8;
  const arzH = 4;
  const arzBody = new THREE.Mesh(
    new THREE.BoxGeometry(arzW, arzH, arzD),
    new THREE.MeshLambertMaterial({ color: 0xb45309 })
  );
  arzBody.position.set(arzX, arzH / 2, arzZ);
  arzBody.castShadow = true;
  arzBody.receiveShadow = true;
  scene.add(arzBody);
  const arzRoof = new THREE.Mesh(
    new THREE.BoxGeometry(arzW + 0.6, 0.5, arzD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x92400e })
  );
  arzRoof.position.set(arzX, arzH + 0.25, arzZ);
  scene.add(arzRoof);
  const arzDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("مرکز مبادله ارز", { bg: "#f59e0b", fg: "#ffffff", w: 512, h: 640, size: 46 }), side: THREE.DoubleSide });
  const arzDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), arzDoorMat);
  arzDoor.position.set(arzX, 1.5, arzZ + arzD / 2 + 0.02);
  scene.add(arzDoor);
  const arzDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("مرکز مبادله ارز", { bg: "#b45309", fg: "#ffffff", w: 512, h: 128, size: 34 }), side: THREE.DoubleSide });
  const arzDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.8), arzDoorSignMat);
  arzDoorSign.position.set(arzX, 3.4, arzZ + arzD / 2 + 0.02);
  scene.add(arzDoorSign);
  colliders.push({
    min: { x: arzX - arzW / 2, z: arzZ - arzD / 2 },
    max: { x: arzX + arzW / 2, z: arzZ + arzD / 2 },
  });
  const exchangeZone = { x: arzX, z: arzZ + arzD / 2 + 5, r: 6 };

  // ---------- ساختمان بازی ----------
  const gameX = 0;
  const gameZ = 45;
  const gameW = 10;
  const gameD = 8;
  const gameH = 4;
  const gameMat = new THREE.MeshLambertMaterial({ color: 0x0f766e });
  const gameB = new THREE.Mesh(new THREE.BoxGeometry(gameW, gameH, gameD), gameMat);
  gameB.position.set(gameX, gameH / 2, gameZ);
  gameB.castShadow = true;
  gameB.receiveShadow = true;
  scene.add(gameB);
  const gameRoof = new THREE.Mesh(
    new THREE.BoxGeometry(gameW + 0.6, 0.5, gameD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x115e59 })
  );
  gameRoof.position.set(gameX, gameH + 0.25, gameZ);
  scene.add(gameRoof);

  const gameDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به بازی", { bg: "#14b8a6", fg: "#ffffff", w: 512, h: 640, size: 52 }), side: THREE.DoubleSide });
  const gameDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), gameDoorMat);
  gameDoor.rotation.y = Math.PI;
  gameDoor.position.set(gameX, 1.5, gameZ - gameD / 2 - 0.02);
  scene.add(gameDoor);
  const gameDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("بازی", { bg: "#0f766e", fg: "#ffffff", w: 256, h: 64, size: 28 }), side: THREE.DoubleSide });
  const gameDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.5), gameDoorSignMat);
  gameDoorSign.rotation.y = Math.PI;
  gameDoorSign.position.set(gameX, 3.4, gameZ - gameD / 2 - 0.02);
  scene.add(gameDoorSign);
  colliders.push({
    min: { x: gameX - gameW / 2, z: gameZ - gameD / 2 },
    max: { x: gameX + gameW / 2, z: gameZ + gameD / 2 },
  });
  const gamesZone = { x: gameX, z: gameZ - gameD / 2 - 5, r: 6 };

  // ---------- ساختمان مدرسه (شاد) ----------
  const schX = 55;
  const schZ = 55;
  const schW = 10;
  const schD = 8;
  const schH = 4;
  const schBody = new THREE.Mesh(
    new THREE.BoxGeometry(schW, schH, schD),
    new THREE.MeshLambertMaterial({ color: 0x2563eb })
  );
  schBody.position.set(schX, schH / 2, schZ);
  schBody.castShadow = true;
  schBody.receiveShadow = true;
  scene.add(schBody);
  const schRoof = new THREE.Mesh(
    new THREE.BoxGeometry(schW + 0.6, 0.5, schD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x1e40af })
  );
  schRoof.position.set(schX, schH + 0.25, schZ);
  scene.add(schRoof);
  const schDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به شاد", { bg: "#60a5fa", fg: "#ffffff", w: 512, h: 640, size: 52 }), side: THREE.DoubleSide });
  const schDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), schDoorMat);
  schDoor.rotation.y = -Math.PI / 2;
  schDoor.position.set(schX - schW / 2 - 0.02, 1.5, schZ);
  scene.add(schDoor);
  const schDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("شاد", { bg: "#2563eb", fg: "#ffffff", w: 256, h: 64, size: 28 }), side: THREE.DoubleSide });
  const schDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.5), schDoorSignMat);
  schDoorSign.rotation.y = -Math.PI / 2;
  schDoorSign.position.set(schX - schW / 2 - 0.02, 3.4, schZ);
  scene.add(schDoorSign);
  colliders.push({
    min: { x: schX - schW / 2, z: schZ - schD / 2 },
    max: { x: schX + schW / 2, z: schZ + schD / 2 },
  });
  const schoolZone = { x: schX - schW / 2 - 5, z: schZ, r: 7 };

  // ---------- ساختمان موزه ----------
  const musX = -55;
  const musZ = 55;
  const musW = 10;
  const musD = 8;
  const musH = 4;
  const musBody = new THREE.Mesh(
    new THREE.BoxGeometry(musW, musH, musD),
    new THREE.MeshLambertMaterial({ color: 0x92400e })
  );
  musBody.position.set(musX, musH / 2, musZ);
  musBody.castShadow = true;
  musBody.receiveShadow = true;
  scene.add(musBody);
  const musRoof = new THREE.Mesh(
    new THREE.BoxGeometry(musW + 0.6, 0.5, musD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x78350f })
  );
  musRoof.position.set(musX, musH + 0.25, musZ);
  scene.add(musRoof);
  const musDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به موزه", { bg: "#f59e0b", fg: "#ffffff", w: 512, h: 640, size: 52 }), side: THREE.DoubleSide });
  const musDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), musDoorMat);
  musDoor.rotation.y = Math.PI / 2;
  musDoor.position.set(musX + musW / 2 + 0.02, 1.5, musZ);
  scene.add(musDoor);
  const musDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("موزه", { bg: "#92400e", fg: "#ffffff", w: 256, h: 64, size: 28 }), side: THREE.DoubleSide });
  const musDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.5), musDoorSignMat);
  musDoorSign.rotation.y = Math.PI / 2;
  musDoorSign.position.set(musX + musW / 2 + 0.02, 3.4, musZ);
  scene.add(musDoorSign);
  colliders.push({
    min: { x: musX - musW / 2, z: musZ - musD / 2 },
    max: { x: musX + musW / 2, z: musZ + musD / 2 },
  });
  const museumZone = { x: musX + musW / 2 + 5, z: musZ, r: 7 };

  // ---------- ساختمان خرید ----------
  const shpX = 55;
  const shpZ = -55;
  const shpW = 10;
  const shpD = 8;
  const shpH = 4;
  const shpBody = new THREE.Mesh(
    new THREE.BoxGeometry(shpW, shpH, shpD),
    new THREE.MeshLambertMaterial({ color: 0xbe185d })
  );
  shpBody.position.set(shpX, shpH / 2, shpZ);
  shpBody.castShadow = true;
  shpBody.receiveShadow = true;
  scene.add(shpBody);
  const shpRoof = new THREE.Mesh(
    new THREE.BoxGeometry(shpW + 0.6, 0.5, shpD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x9d174d })
  );
  shpRoof.position.set(shpX, shpH + 0.25, shpZ);
  scene.add(shpRoof);
  colliders.push({
    min: { x: shpX - shpW / 2, z: shpZ - shpD / 2 },
    max: { x: shpX + shpW / 2, z: shpZ + shpD / 2 },
  });
  const shopZone = { x: shpX - shpW / 2 - 5, z: shpZ, r: 7 };

  const shpDoorMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("ورود به فروشگاه", { bg: "#f472b6", fg: "#ffffff", w: 512, h: 640, size: 48 }), side: THREE.DoubleSide });
  const shpDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), shpDoorMat);
  shpDoor.rotation.y = -Math.PI / 2;
  shpDoor.position.set(shpX - shpW / 2 - 0.02, 1.5, shpZ);
  scene.add(shpDoor);
  const shpDoorSignMat = new THREE.MeshBasicMaterial({ map: makeTextTexture("فروشگاه", { bg: "#be185d", fg: "#ffffff", w: 256, h: 64, size: 28 }), side: THREE.DoubleSide });
  const shpDoorSign = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.5), shpDoorSignMat);
  shpDoorSign.rotation.y = -Math.PI / 2;
  shpDoorSign.position.set(shpX - shpW / 2 - 0.02, 3.4, shpZ);
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

  return { colliders, managementZone, gamesZone, schoolZone, museumZone, shopZone, realEstateZone, exchangeZone, spawn: { x: 0, z: 22 } };
}
