import * as THREE from "three";

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
  const plaza = new THREE.Mesh(
    new THREE.BoxGeometry(60, 0.3, 60),
    new THREE.MeshLambertMaterial({ color: 0x9aa3ad })
  );
  plaza.position.set(0, 0.15, 0);
  plaza.receiveShadow = true;
  scene.add(plaza);

  // ستون‌های میدان
  for (const [dx, dz] of [[-28, -28], [28, -28], [-28, 28], [28, 28]]) {
    const col = buildingBox(1, 6, 1, 0x6b7280, dx, dz);
    scene.add(col);
    colliders.push({ min: { x: dx - 0.5, z: dz - 0.5 }, max: { x: dx + 0.5, z: dz + 0.5 } });
  }

  // فواره/مجسمه وسط میدان
  const fountain = new THREE.Mesh(
    new THREE.CylinderGeometry(3, 3.4, 0.8, 24),
    new THREE.MeshLambertMaterial({ color: 0x0ea5e9 })
  );
  fountain.position.set(0, 0.4, 0);
  fountain.castShadow = true;
  scene.add(fountain);
  const fountainTop = new THREE.Mesh(
    new THREE.ConeGeometry(0.8, 1.4, 12),
    new THREE.MeshLambertMaterial({ color: 0x38bdf8 })
  );
  fountainTop.position.set(0, 1.4, 0);
  scene.add(fountainTop);

  // ---------- خیابان‌ها ----------
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x4b5563 });
  const roadH = new THREE.Mesh(new THREE.BoxGeometry(WORLD, 0.06, 10), roadMat);
  roadH.position.set(0, 0.03, 0);
  roadH.receiveShadow = true;
  scene.add(roadH);
  const roadV = new THREE.Mesh(new THREE.BoxGeometry(10, 0.06, WORLD), roadMat);
  roadV.position.set(0, 0.03, 0);
  roadV.receiveShadow = true;
  scene.add(roadV);

  // ---------- ساختمان‌های معمولی (بلوک‌های شهر) ----------
  const palette = [0x64748b, 0x94a3b8, 0x78716c, 0x8a7b6a, 0x9ca3af, 0x6b7280, 0x7c6e5f];
  const roofPalette = [0x3f4a45, 0x4a5d52, 0x55503f];
  const occupied = []; // نواحی اشغال نشده توسط میدان و شاخص‌ها

  // محل ساختمان‌ها در دو طرف خیابان‌ها، در فاصله از میدان
  const offsets = [-85, -55, -20, 20, 55, 85]; // فاصله از مرکز در امتداد هر خیابان
  const sides = [12, 26, 40]; // فاصله عمودی از خط خیابان

  for (const off of offsets) {
    for (const side of sides) {
      for (const dir of [1, -1]) {
        // ساختمان در امتداد خیابان افقی (محور x)
        const bx = off + (Math.random() - 0.5) * 6;
        const bz = side * dir + (Math.random() - 0.5) * 5;
        if (Math.abs(bx) > 55 || Math.abs(bz) < 12 || Math.abs(bz) > 95) continue;
        addBlock(bx, bz);

        // ساختمان در امتداد خیابان عمودی (محور z) — یک بلوک در هر مجاورت
        const bx2 = side * dir + (Math.random() - 0.5) * 5;
        const bz2 = off + (Math.random() - 0.5) * 6;
        if (Math.abs(bz2) > 55 || Math.abs(bx2) < 12 || Math.abs(bx2) > 95) continue;
        addBlock(bx2, bz2);
      }
    }
  }

  function addBlock(x, z) {
    const w = 8 + Math.random() * 8;
    const d = 8 + Math.random() * 8;
    const h = 6 + Math.random() * 12;
    const bw = Math.round(w);
    const bd = Math.round(d);
    // محدودیت به داخل محدوده شهر
    if (Math.abs(x) + bw / 2 > 150 || Math.abs(z) + bd / 2 > 150) return;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const roof = roofPalette[Math.floor(Math.random() * roofPalette.length)];

    const mesh = buildingBox(bw, h, bd, color, x, z);
    scene.add(mesh);
    const roofTop = new THREE.Mesh(
      new THREE.BoxGeometry(bw + 0.4, 0.6, bd + 0.4),
      new THREE.MeshLambertMaterial({ color: roof })
    );
    roofTop.position.set(x, h + 0.3, z);
    scene.add(roofTop);

    colliders.push({
      min: { x: x - bw / 2, z: z - bd / 2 },
      max: { x: x + bw / 2, z: z + bd / 2 },
    });
    occupied.push({ x, z, r: Math.max(bw, bd) / 2 + 2 });
  }

  // ---------- ساختمان مدیریت (شاخص ۱) ----------
  const mgmtX = 0;
  const mgmtZ = -70; // سمت جنوب میدان
  const mgmtW = 20;
  const mgmtD = 16;
  const mgmtH = 30;
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

  // تابلو «مدیریت»
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

  // درب مدیریت (در سمت رو به میدان)
  const doorMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
  const mgmtDoor = new THREE.Mesh(new THREE.BoxGeometry(5, 6, 0.3), doorMat);
  mgmtDoor.position.set(mgmtX, 3, mgmtZ + mgmtD / 2 + 0.2);
  scene.add(mgmtDoor);

  // ---------- ساختمان بازی (شاخص ۲) ----------
  const gameX = 0;
  const gameZ = 70; // سمت شمال میدان
  const gameW = 22;
  const gameD = 18;
  const gameH = 26;
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

  const gameDoor = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 0.3), doorMat);
  gameDoor.position.set(gameX, 3, gameZ - gameD / 2 - 0.2);
  scene.add(gameDoor);

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

  return { colliders, managementZone, gamesZone, spawn: { x: 0, z: 0 } };
}
