import * as THREE from "three";

// ساختار پیش‌فرض آواتارها به صورت رویه‌ای با شکل‌های پایه سه.js.
// هر آواتار یک THREE.Group است که در WebLobby به صحنه اضافه و حرکت داده می‌شود.

const SKIN = 0xf2c9a0;
const SKIN2 = 0xe0ac69;

function mat(color, opts = {}) {
  const m = new THREE.MeshLambertMaterial({ color, ...opts });
  return m;
}

function box(w, h, d, color, opts) {
  const g = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(g, mat(color, opts));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function sphere(r, color, opts) {
  const g = new THREE.SphereGeometry(r, 20, 16);
  const mesh = new THREE.Mesh(g, mat(color, opts));
  mesh.castShadow = true;
  return mesh;
}

function buildHumanoid({
  skin,
  shirt,
  pants,
  shoes,
  hair,
  hairStyle, // "long" | "short" | "ponytail" | "cap"
  sweatShirt = false,
}) {
  const root = new THREE.Group();

  // پاها
  const legY = -0.55;
  const legL = box(0.16, 0.5, 0.16, pants);
  legL.position.set(-0.13, legY, 0);
  const legR = box(0.16, 0.5, 0.16, pants);
  legR.position.set(0.13, legY, 0);

  // کفش
  const shoeL = box(0.18, 0.1, 0.24, shoes);
  shoeL.position.set(-0.13, legY - 0.3, 0.03);
  const shoeR = box(0.18, 0.1, 0.24, shoes);
  shoeR.position.set(0.13, legY - 0.3, 0.03);

  // تنه
  const torso = box(0.52, 0.55, 0.26, shirt, {
    transparent: sweatShirt ? false : undefined,
  });
  torso.position.set(0, -0.1, 0);
  if (sweatShirt) {
    const band = box(0.54, 0.12, 0.28, 0xffffff);
    band.position.set(0, -0.33, 0);
    torso.add(band);
  }

  // بازوها
  const armY = -0.05;
  const armL = box(0.11, 0.42, 0.13, shirt);
  armL.position.set(-0.33, armY, 0);
  const armR = box(0.11, 0.42, 0.13, shirt);
  armR.position.set(0.33, armY, 0);

  // دست‌ها
  const handL = box(0.09, 0.1, 0.1, skin);
  handL.position.set(-0.33, armY - 0.26, 0);
  const handR = box(0.09, 0.1, 0.1, skin);
  handR.position.set(0.33, armY - 0.26, 0);

  // سر
  const head = sphere(0.2, skin);
  head.position.set(0, 0.46, 0);

  // چشم‌ها
  const eyeMat = mat(0x222222);
  const eyeGeo = new THREE.SphereGeometry(0.028, 10, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.07, 0.5, -0.18);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.07, 0.5, -0.18);

  // دهان
  const mouth = box(0.1, 0.02, 0.02, 0x7b3b2a);
  mouth.position.set(0, 0.4, -0.195);

  root.add(legL, legR, shoeL, shoeR, torso, armL, armR, handL, handR, head, eyeL, eyeR, mouth);

  // مو
  const hairGroup = new THREE.Group();
  if (hairStyle === "long") {
    const top = sphere(0.21, hair);
    top.position.y = 0.06;
    top.scale.set(1, 0.9, 1);
    const back = box(0.34, 0.5, 0.18, hair);
    back.position.set(0, -0.22, -0.06);
    const sideL = box(0.1, 0.34, 0.2, hair);
    sideL.position.set(-0.24, -0.14, 0);
    const sideR = box(0.1, 0.34, 0.2, hair);
    sideR.position.set(0.24, -0.14, 0);
    hairGroup.add(top, back, sideL, sideR);
  } else if (hairStyle === "ponytail") {
    const top = sphere(0.21, hair);
    top.position.y = 0.06;
    top.scale.set(1, 0.9, 1);
    const tie = sphere(0.1, hair);
    tie.position.set(0, -0.34, -0.22);
    hairGroup.add(top, tie);
  } else if (hairStyle === "cap") {
    const cap = box(0.42, 0.12, 0.42, hair);
    cap.position.y = 0.16;
    const brim = box(0.42, 0.06, 0.3, hair);
    brim.position.set(0, 0.12, 0.2);
    hairGroup.add(cap, brim);
  } else {
    // short (پسر)
    const top = sphere(0.21, hair);
    top.position.y = 0.06;
    top.scale.set(1, 0.7, 1);
    hairGroup.add(top);
  }
  hairGroup.position.y = 0.46;
  root.add(hairGroup);

  return root;
}

// چهار آواتار پیش‌فرض: دو دختر و دو پسر
export const AVAATARS = [
  {
    id: "girl1",
    label: "دختر ۱ - سارا",
    build: () =>
      buildHumanoid({
        skin: SKIN,
        shirt: 0xec4899,
        pants: 0x1e3a8a,
        shoes: 0x111111,
        hair: 0x2b1b12,
        hairStyle: "long",
      }),
  },
  {
    id: "girl2",
    label: "دختر ۲ - نیلوفر",
    build: () =>
      buildHumanoid({
        skin: SKIN2,
        shirt: 0x8b5cf6,
        pants: 0x0f766e,
        shoes: 0x222222,
        hair: 0x111111,
        hairStyle: "ponytail",
        sweatShirt: true,
      }),
  },
  {
    id: "boy1",
    label: "پسر ۱ - امیر",
    build: () =>
      buildHumanoid({
        skin: SKIN,
        shirt: 0x2563eb,
        pants: 0x334155,
        shoes: 0x111111,
        hair: 0x1f2937,
        hairStyle: "short",
      }),
  },
  {
    id: "boy2",
    label: "پسر ۲ - کیان",
    build: () =>
      buildHumanoid({
        skin: SKIN2,
        shirt: 0x16a34a,
        pants: 0x1f2937,
        shoes: 0x222222,
        hair: 0x111111,
        hairStyle: "cap",
      }),
  },
];

export function getAvatar(id) {
  const av = AVAATARS.find((a) => a.id === id) || AVAATARS[0];
  return av.build();
}
