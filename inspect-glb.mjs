import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import fs from "fs";
import path from "path";

const base = "C:/Users/user/Desktop/New folder/royashahr/public/characters";

const loader = new GLTFLoader();

for (const g of ["male", "female"]) {
  for (let i = 1; i <= 4; i++) {
    const f = path.join(base, g, `${g}-0${i}.glb`);
    const data = fs.readFileSync(f);
    const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    try {
      const gltf = await loader.parseAsync(ab, "");
      const scene = gltf.scene || gltf.scenes[0];
      const clips = (gltf.animations || []).map((a) => a.name);
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      let hasSkin = false;
      scene.traverse((o) => { if (o.isSkinnedMesh) hasSkin = true; });
      console.log(`\n=== ${g}-0${i}.glb ===`);
      console.log("animations:", JSON.stringify(clips));
      console.log("size:", size.x.toFixed(2), size.y.toFixed(2), size.z.toFixed(2), "center:", center.x.toFixed(2), center.y.toFixed(2), center.z.toFixed(2));
      console.log("hasSkinnedMesh:", hasSkin);
    } catch (e) {
      console.log(`\n=== ${g}-0${i}.glb === ERROR:`, e.message);
    }
  }
}
