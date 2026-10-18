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
    const col = buildingBox(1, 6, 1, 0x6b7280, dx, dz);
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
  const mgmtZ = -70;
  const mgmtW = 20;
  const mgmtD = 16;
  const mgmtH = 15;
  const mgmtMat = new THREE.MeshLambertMaterial({ color: 0x1d4ed8 });
  const mgmt = new THREE.Mesh(new THREE.BoxGeometry(mgmtW, mgmtH, mgmtD), mgmtMat);
  mgmt.position.set(mgmtX, mgmtH / 2, mgmtZ);
  mgmt.castShadow = true;
  mgmt.receiveShadow = true;
  scene.add(mgmt);
  const mgmtRoof = new THREE.Mesh(
    new THREE.BoxGeometry(mgmtW + 0.6, 1, mgmtD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x1e3a8a })
  );
  mgmtRoof.position.set(mgmtX, mgmtH + 0.5, mgmtZ);
  scene.add(mgmtRoof);

  const signMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان مدیریت", { bg: "#1d4ed8", fg: "#ffffff" }),
  });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), signMat);
  sign.position.set(mgmtX, mgmtH + 2, mgmtZ);
  scene.add(sign);

  colliders.push({
    min: { x: mgmtX - mgmtW / 2, z: mgmtZ - mgmtD / 2 },
    max: { x: mgmtX + mgmtW / 2, z: mgmtZ + mgmtD / 2 },
  });
  const managementZone = { x: mgmtX, z: mgmtZ + mgmtD / 2 + 5, r: 6 };

  const mgmtDoorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(4, 5, 0.15),
    new THREE.MeshLambertMaterial({ color: 0x7c4a1e })
  );
  mgmtDoorPanel.position.set(mgmtX, 2.5, mgmtZ + mgmtD / 2 - 0.08);
  scene.add(mgmtDoorPanel);
  const mgmtDoorInner = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 4.2, 0.16),
    new THREE.MeshLambertMaterial({ color: 0x5c3317 })
  );
  mgmtDoorInner.position.set(mgmtX, 2.5, mgmtZ + mgmtD / 2 - 0.075);
  scene.add(mgmtDoorInner);

  // ---------- ساختمان بازی ----------
  const gameX = 0;
  const gameZ = 70;
  const gameW = 22;
  const gameD = 18;
  const gameH = 13;
  const gameMat = new THREE.MeshLambertMaterial({ color: 0x0f766e });
  const gameB = new THREE.Mesh(new THREE.BoxGeometry(gameW, gameH, gameD), gameMat);
  gameB.position.set(gameX, gameH / 2, gameZ);
  gameB.castShadow = true;
  gameB.receiveShadow = true;
  scene.add(gameB);
  const gameRoof = new THREE.Mesh(
    new THREE.BoxGeometry(gameW + 0.6, 1, gameD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x115e59 })
  );
  gameRoof.position.set(gameX, gameH + 0.5, gameZ);
  scene.add(gameRoof);

  const gameSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان بازی", { bg: "#0f766e", fg: "#ffffff" }),
  });
  const gameSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), gameSignMat);
  gameSign.position.set(gameX, gameH + 2, gameZ);
  scene.add(gameSign);

  colliders.push({
    min: { x: gameX - gameW / 2, z: gameZ - gameD / 2 },
    max: { x: gameX + gameW / 2, z: gameZ + gameD / 2 },
  });
  const gamesZone = { x: gameX, z: gameZ - gameD / 2 - 5, r: 6 };

  const gameDoorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(5, 4.5, 0.15),
    new THREE.MeshLambertMaterial({ color: 0x134e4a })
  );
  gameDoorPanel.position.set(gameX, 2.5, gameZ - gameD / 2 + 0.08);
  scene.add(gameDoorPanel);
  const gameDoorInner = new THREE.Mesh(
    new THREE.BoxGeometry(4, 3.5, 0.16),
    new THREE.MeshLambertMaterial({ color: 0x0d3d3a })
  );
  gameDoorInner.position.set(gameX, 2.5, gameZ - gameD / 2 + 0.075);
  scene.add(gameDoorInner);

  // ---------- ساختمان مدرسه (شاد) ----------
  const schX = 85;
  const schZ = 85;
  const schW = 20;
  const schD = 16;
  const schH = 12;
  const schBody = new THREE.Mesh(
    new THREE.BoxGeometry(schW, schH, schD),
    new THREE.MeshLambertMaterial({ color: 0x2563eb })
  );
  schBody.position.set(schX, schH / 2, schZ);
  schBody.castShadow = true;
  schBody.receiveShadow = true;
  scene.add(schBody);
  const schRoof = new THREE.Mesh(
    new THREE.BoxGeometry(schW + 0.6, 1, schD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x1e40af })
  );
  schRoof.position.set(schX, schH + 0.5, schZ);
  scene.add(schRoof);
  const schSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان مدرسه (شاد)", { bg: "#2563eb", fg: "#ffffff" }),
  });
  const schSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), schSignMat);
  schSign.position.set(schX, schH + 2, schZ);
  scene.add(schSign);
  colliders.push({
    min: { x: schX - schW / 2, z: schZ - schD / 2 },
    max: { x: schX + schW / 2, z: schZ + schD / 2 },
  });
  const schoolZone = { x: schX - schW / 2 - 5, z: schZ, r: 7 };

  const schDoorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 4.5, 4),
    new THREE.MeshLambertMaterial({ color: 0x1e40af })
  );
  schDoorPanel.position.set(schX - schW / 2 + 0.08, 2.5, schZ);
  scene.add(schDoorPanel);
  const schDoorInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 3.5, 3.2),
    new THREE.MeshLambertMaterial({ color: 0x1d4ed8 })
  );
  schDoorInner.position.set(schX - schW / 2 + 0.075, 2.5, schZ);
  scene.add(schDoorInner);

  // ---------- ساختمان موزه ----------
  const musX = -85;
  const musZ = 85;
  const musW = 22;
  const musD = 16;
  const musH = 10;
  const musBody = new THREE.Mesh(
    new THREE.BoxGeometry(musW, musH, musD),
    new THREE.MeshLambertMaterial({ color: 0x92400e })
  );
  musBody.position.set(musX, musH / 2, musZ);
  musBody.castShadow = true;
  musBody.receiveShadow = true;
  scene.add(musBody);
  const musRoof = new THREE.Mesh(
    new THREE.BoxGeometry(musW + 0.6, 1, musD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x78350f })
  );
  musRoof.position.set(musX, musH + 0.5, musZ);
  scene.add(musRoof);
  const musSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("موزه ملی", { bg: "#92400e", fg: "#ffffff" }),
  });
  const musSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), musSignMat);
  musSign.position.set(musX, musH + 2, musZ);
  scene.add(musSign);
  colliders.push({
    min: { x: musX - musW / 2, z: musZ - musD / 2 },
    max: { x: musX + musW / 2, z: musZ + musD / 2 },
  });
  const museumZone = { x: musX + musW / 2 + 5, z: musZ, r: 7 };

  const musDoorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 3.5, 4.5),
    new THREE.MeshLambertMaterial({ color: 0x78350f })
  );
  musDoorPanel.position.set(musX + musW / 2 - 0.08, 2, musZ);
  scene.add(musDoorPanel);
  const musDoorInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 2.8, 3.6),
    new THREE.MeshLambertMaterial({ color: 0x5c3317 })
  );
  musDoorInner.position.set(musX + musW / 2 - 0.075, 2, musZ);
  scene.add(musDoorInner);

  // ---------- ساختمان خرید ----------
  const shpX = 85;
  const shpZ = -85;
  const shpW = 18;
  const shpD = 16;
  const shpH = 11;
  const shpBody = new THREE.Mesh(
    new THREE.BoxGeometry(shpW, shpH, shpD),
    new THREE.MeshLambertMaterial({ color: 0xbe185d })
  );
  shpBody.position.set(shpX, shpH / 2, shpZ);
  shpBody.castShadow = true;
  shpBody.receiveShadow = true;
  scene.add(shpBody);
  const shpRoof = new THREE.Mesh(
    new THREE.BoxGeometry(shpW + 0.6, 1, shpD + 0.6),
    new THREE.MeshLambertMaterial({ color: 0x9d174d })
  );
  shpRoof.position.set(shpX, shpH + 0.5, shpZ);
  scene.add(shpRoof);
  const shpSignMat = new THREE.MeshBasicMaterial({
    map: makeTextTexture("ساختمان خرید", { bg: "#be185d", fg: "#ffffff" }),
  });
  const shpSign = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), shpSignMat);
  shpSign.position.set(shpX, shpH + 2, shpZ);
  scene.add(shpSign);
  colliders.push({
    min: { x: shpX - shpW / 2, z: shpZ - shpD / 2 },
    max: { x: shpX + shpW / 2, z: shpZ + shpD / 2 },
  });
  const shopZone = { x: shpX - shpW / 2 - 5, z: shpZ, r: 7 };

  const shpDoorPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 4, 3.8),
    new THREE.MeshLambertMaterial({ color: 0x9d174d })
  );
  shpDoorPanel.position.set(shpX - shpW / 2 + 0.08, 2.2, shpZ);
  scene.add(shpDoorPanel);
  const shpDoorInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 3.2, 3),
    new THREE.MeshLambertMaterial({ color: 0x7f1d4e })
  );
  shpDoorInner.position.set(shpX - shpW / 2 + 0.075, 2.2, shpZ);
  scene.add(shpDoorInner);

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
