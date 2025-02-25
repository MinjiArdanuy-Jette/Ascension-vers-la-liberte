import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/*********************CRÉATION DE LA SCÈNE, DE LA CAMÉRA, DU RENDU ET DE LA LUMIÈRE ******************** */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const canvas = document.getElementById("scene2");
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

camera.position.z = 5;

/*********************IMPORTATION DE LA MACHINE À PINCES ******************** */
// GLTF Loader pour charger les modèles
const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/Ours.glb", (gltf) => {
  const mesh = gltf.scene;
  mesh.scale.set(0.5, 0.5, 0.5);
  scene.add(mesh);
});

/*********************FONCTION POUR LES ÉLÉMENTS À ÊTRE MISE À JOUR ******************** */
function animate() {
  requestAnimationFrame(animate);

  renderer.render(scene, camera);
}
animate();
