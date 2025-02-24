import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

let scenes = [];
let mixers = [];
let renderers = [];
let actions = [];
let cameras = [];

// Fonction pour créer une scène avec un modèle
function createScene(canvasId, modelPath, startPosition, zoomTarget) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) {
    console.error(`Canvas avec l'ID "${canvasId}" non trouvé !`);
    return;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // Fond noir pour bien voir les modèles

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderers.push(renderer);

  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.copy(startPosition);
  cameras.push(camera);

  // Ajout des lumières
  const ambientLight = new THREE.AmbientLight(0xffffff, 2);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(2, 2, 2);
  scene.add(directionalLight);

  // Chargement du modèle
  const loader = new GLTFLoader();
  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      scene.add(model);
      model.position.set(0, 0, 0);
      model.scale.set(0.5, 0.5, 0.5);
      console.log(`✅ Modèle "${modelPath}" chargé avec succès !`);

      if (gltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(model);
        mixers.push(mixer);
        actions.push(
          gltf.animations.map((clip) => {
            const action = mixer.clipAction(clip);
            action.loop = THREE.LoopOnce;
            action.clampWhenFinished = true;
            return action;
          })
        );

        actions[actions.length - 1].forEach((action) => {
          action.play();
          action.paused = true;
          action.time = 0;
          mixer.update(0);
        });
      }
    },
    undefined,
    (error) => {
      console.error(`❌ Erreur de chargement du modèle "${modelPath}":`, error);
    }
  );

  scenes.push({ scene, camera, zoomTarget });
}

// Initialiser les deux scènes
createScene(
  "scene1",
  "./modeles/Collier.glb",
  new THREE.Vector3(0, 5, 5),
  new THREE.Vector3(0, 1.5, 0)
);
// createScene(
//   "scene2",
//   "./modeles/Collier.glb",
//   new THREE.Vector3(2, 3, 5),
//   new THREE.Vector3(0, 0, 0)
// );

// Animation des scènes
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const deltaTime = clock.getDelta();

  scenes.forEach((item, index) => {
    if (mixers[index]) mixers[index].update(deltaTime);

    // Mouvement léger de la caméra pour tester l'affichage
    item.camera.position.x = Math.sin(clock.elapsedTime) * 2;
    item.camera.lookAt(item.zoomTarget);

    renderers[index].render(item.scene, item.camera);
  });
}

animate();

// Gérer le redimensionnement
window.addEventListener("resize", () => {
  scenes.forEach((item, index) => {
    const canvas = renderers[index].domElement;
    item.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    item.camera.updateProjectionMatrix();
    renderers[index].setSize(canvas.clientWidth, canvas.clientHeight);
  });
});
