import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

// بارگذاری غیرهمزمان مدل‌های GLB و کنترل انیمیشن‌های آنها از طریق AnimationMixer.
// داده‌محور: هر آواتار در آرایه‌ی AVAATARS یک تعریف ساده دارد (شناسه، جنسیت،
// مسیر مدل و برچسب) و کل سیستم برای همه‌ی مدل‌ها از یک مسیر کد یکسان استفاده می‌کند.
const loader = new GLTFLoader();

// مقیاس مدل‌های GLB (ارتفاع ~۴.۸ واحد) به اندازه‌ی کاراکتر فعلی در دنیا.
const SCALE = 0.4;

// نگاشت نام کلیپ‌های انیمیشن به حالت‌های استاندارد. نام‌ها در همه‌ی مدل‌ها فقط از
// نظر پیشوند (Man_/Female_) متفاوت‌اند و پسوند مشترک دارند؛ پس با یک الگوی عمومی
// پیدا شده و به حالت استاندارد نگاشت می‌شوند. در صورت نبود هر حالت، به idle برمی‌گردد.
const STATE_PATTERNS = {
  idle: /_Idle$/i,
  walk: /_Walk$/i,
  run: /_Run$/i,
  jump: /_Jump$/i,
  runningJump: /_RunningJump$/i,
};

export const AVAATARS = [
  // ---------- مردان ----------
  { id: "male-01", gender: "male", label: "پسر ۱ - امیر", path: "/characters/male/male-01.glb" },
  { id: "male-02", gender: "male", label: "پسر ۲ - کیان", path: "/characters/male/male-02.glb" },
  { id: "male-03", gender: "male", label: "پسر ۳ - آریا", path: "/characters/male/male-03.glb" },
  { id: "male-04", gender: "male", label: "پسر ۴ - سامان", path: "/characters/male/male-04.glb" },
  // ---------- زنان ----------
  { id: "female-01", gender: "female", label: "دختر ۱ - سارا", path: "/characters/female/female-01.glb" },
  { id: "female-02", gender: "female", label: "دختر ۲ - نیلوفر", path: "/characters/female/female-02.glb" },
  { id: "female-03", gender: "female", label: "دختر ۳ - مریم", path: "/characters/female/female-03.glb" },
  { id: "female-04", gender: "female", label: "دختر ۴ - هستی", path: "/characters/female/female-04.glb" },
];

export function getAvatarDef(id) {
  return AVAATARS.find((a) => a.id === id) || AVAATARS[0];
}

// یافتن کلیپ‌های انیمیشن هر حالت از روی لیست کلیپ‌های مدل.
function collectClips(animations) {
  const clips = {};
  for (const name of Object.keys(STATE_PATTERNS)) {
    const clip = animations.find((a) => STATE_PATTERNS[name].test(a.name));
    if (clip) clips[name] = clip;
  }
  // در صورت نبود jump، از runningJump استفاده می‌شود تا حرکت پرش همچنان کار کند.
  if (!clips.jump && clips.runningJump) clips.jump = clips.runningJump;
  // همیشه باید حداقل idle وجود داشته باشد.
  if (!clips.idle && animations.length) clips.idle = animations[0];
  return clips;
}

// یک کنترل‌کننده‌ی سبک انیمیشن که روی userData کاراکتر قرار می‌گیرد تا WebLobby
// بتواند با متدهای ساده حالت حرکت (idle/walk/run) را با انتقال نرم تعویض کند.
class AvatarController {
  constructor(model, gltf) {
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = collectClips(gltf.animations || []);
    this.current = null;

    for (const name of Object.keys(this.actions)) {
      const action = this.mixer.clipAction(this.actions[name]);
      if (name === "idle") {
        action.play();
        action.setEffectiveWeight(1);
      } else {
        // اکشن‌های غیرفعال را بدون صدا کردن play ذخیره می‌کنیم تا بعداً آماده باشند.
        action.setEffectiveWeight(0);
        action.setEffectiveTimeScale(0);
      }
    }
    this.mixer.update(0);

    model.userData.mixer = this.mixer;
    model.userData.avatarController = this;
    model.userData.animClips = this.actions;
  }

  // تعویض حالت با crossFade نرم برای جلوگیری از پرش ناگهانی idle↔walk/run.
  setState(name) {
    if (!this.actions[name] || this.current === name) return;

    const fromAction = this.current ? this.mixer.clipAction(this.actions[this.current]) : null;
    const toAction = this.mixer.clipAction(this.actions[name]);

    toAction.reset();
    toAction.setEffectiveWeight(1);
    toAction.setEffectiveTimeScale(1);
    toAction.play();

    // از idle به حرکت (و برعکس) با fade طولانی‌تر؛ بین حرکت‌ها سریع‌تر.
    const wasIdle = this.current === "idle" || this.current === null;
    const toIdle = name === "idle";
    const fade = wasIdle || toIdle ? 0.3 : 0.15;

    if (fromAction && fromAction !== toAction) {
      fromAction.crossFadeTo(toAction, fade, false);
    }

    this.current = name;
  }

  update(dt) {
    this.mixer.update(dt);
  }
}

// بارگذاری و ساخت یک آواتار از روی شناسه. هر نمونه‌ی مدل با cloneSkeleton
// کپی می‌شود تا اشتراک‌گذاری اشتباه SkinnedMesh بین نمونه‌های هم‌ریگ اتفاق نیفتد.
// نمونه‌ی بارگذاری‌شده مقیاس‌شده، روی زمین (y=0) قرار گرفته و مجهز به انیمیشن می‌شود.
export async function loadAvatar(id) {
  const def = getAvatarDef(id);
  const gltf = await loader.loadAsync(def.path);
  const model = cloneSkeleton(gltf.scene);
  model.scale.setScalar(SCALE);
  model.position.y = 0;
  model.userData.avatarDef = def;
  return model;
}

export async function loadAvatarWithAnimation(id) {
  const def = getAvatarDef(id);
  const gltf = await loader.loadAsync(def.path);
  const model = cloneSkeleton(gltf.scene);
  model.scale.setScalar(SCALE);
  model.position.y = 0;
  const controller = new AvatarController(model, gltf);
  model.userData.avatarDef = def;
  return { model, controller };
}

// سازگاری برای کدهای قدیمی که به صورت همزمان آواتار می‌ساختند: ইনترفیس جدید
// غیرهمزمان است، پس اخطار صریح داده می‌شود تا کد مصرف‌کننده به loadAvatar ارتقا یابد.
export function getAvatar(id) {
  const def = getAvatarDef(id);
  console.warn("[avatars] getAvatar همزمان است. لطفاً از loadAvatar/loadAvatarWithAnimation استفاده کنید.");
  return def;
}
