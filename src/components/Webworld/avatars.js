import * as THREE from "three";

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
  hairStyle,
  sweatShirt = false,
}) {
  const root = new THREE.Group();
  const animRefs = { leftLeg: null, rightLeg: null, leftArm: null, rightArm: null };

  const legGroupL = new THREE.Group();
  const legGroupR = new THREE.Group();
  legGroupL.position.set(-0.13, 0.55, 0);
  legGroupR.position.set(0.13, 0.55, 0);

  const legL = box(0.16, 0.55, 0.16, pants);
  legL.position.set(0, -0.275, 0);
  const shoeL = box(0.18, 0.1, 0.24, shoes);
  shoeL.position.set(0, -0.55, 0.03);
  legGroupL.add(legL, shoeL);

  const legR = box(0.16, 0.55, 0.16, pants);
  legR.position.set(0, -0.275, 0);
  const shoeR = box(0.18, 0.1, 0.24, shoes);
  shoeR.position.set(0, -0.55, 0.03);
  legGroupR.add(legR, shoeR);

  animRefs.leftLeg = legGroupL;
  animRefs.rightLeg = legGroupR;

  const torso = box(0.52, 0.55, 0.26, shirt);
  torso.position.set(0, 0.825, 0);

  const armGroupL = new THREE.Group();
  const armGroupR = new THREE.Group();
  armGroupL.position.set(-0.33, 0.825, 0);
  armGroupR.position.set(0.33, 0.825, 0);

  const armL = box(0.11, 0.42, 0.13, shirt);
  armL.position.set(0, -0.21, 0);
  const handL = box(0.09, 0.1, 0.1, skin);
  handL.position.set(0, -0.47, 0);
  armGroupL.add(armL, handL);

  const armR = box(0.11, 0.42, 0.13, shirt);
  armR.position.set(0, -0.21, 0);
  const handR = box(0.09, 0.1, 0.1, skin);
  handR.position.set(0, -0.47, 0);
  armGroupR.add(armR, handR);

  animRefs.leftArm = armGroupL;
  animRefs.rightArm = armGroupR;

  const head = sphere(0.2, skin);
  head.position.set(0, 1.2, 0);

  const eyeMat = mat(0x222222);
  const eyeGeo = new THREE.SphereGeometry(0.028, 10, 8);
  const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
  eyeL.position.set(-0.07, 1.2, -0.18);
  const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
  eyeR.position.set(0.07, 1.2, -0.18);

  const mouth = box(0.1, 0.02, 0.02, 0x7b3b2a);
  mouth.position.set(0, 1.1, -0.195);

  root.add(legGroupL, legGroupR, torso, armGroupL, armGroupR, head, eyeL, eyeR, mouth);

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
    const top = sphere(0.21, hair);
    top.position.y = 0.06;
    top.scale.set(1, 0.7, 1);
    hairGroup.add(top);
  }
  hairGroup.position.y = 1.2;
  root.add(hairGroup);

  root.userData.animRefs = animRefs;
  return root;
}

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
