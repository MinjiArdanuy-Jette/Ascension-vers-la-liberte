import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let mesh;
let mixer;
let actions = [];
/*********************CRÉATION DE LA SCÈNE, DE LA CAMÉRA, DU RENDU ET DE LA LUMIÈRE ******************** */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const canvas = document.getElementById("scene1");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

const ambientLight = new THREE.AmbientLight("white", 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight("white", 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Contrôles OrbitControls pour naviguer avec la souris
const controls = new OrbitControls(camera, renderer.domElement);

// Permet d'afficher la position de la caméra dans la console
controls.addEventListener("change", () => {
  console.log(
    `Position de la caméra : x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`
  );
});

/*********************IMPORTATION DE L'ENVELOPPE ******************** */

const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/Collier.glb", (gltf) => {
  mesh = gltf.scene;
  scene.add(mesh);
  mesh.rotation.x = Math.PI;

  camera.position.set(0, 22, 4);
  camera.lookAt(mesh.position);

  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(mesh);
    actions = gltf.animations.map((clip) => {
      const action = mixer.clipAction(clip);
      action.loop = THREE.LoopOnce;
      action.clampWhenFinished = true;
      return action;
    });

    // Mettre les animations sur pause au frame 0
    actions.forEach((action) => {
      action.play();
      action.paused = true;
      action.time = 0;
      mixer.update(0);
    });
  }
});

/*********************FONCTION POUR LES ÉLÉMENTS À ÊTRE MISE À JOUR ******************** */
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (mixer) {
    mixer.update(deltaTime);
  }

  renderer.render(scene, camera);
}

animate();
