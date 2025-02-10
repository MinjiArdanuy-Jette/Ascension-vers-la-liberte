import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

// Scène, caméra et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / window.innerHeight,
  0.1,
  1000
);

// Positionner la caméra
camera.position.z = 10;
camera.position.y = 15;
camera.position.x = -5;

// Rendu
const canvas = document.querySelector("#machine-canvas");
const renderer = new THREE.WebGLRenderer({
  // antialias: true,
  canvas,
  // alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Ajouter une lumière à la scène
const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 0.5);
directionalLight.position.x = 1;
directionalLight.position.z = 1;
scene.add(directionalLight);

// gltf loader
const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/Machine-pince.glb", (gltf) => {
  const mesh = gltf.scene.children[0];
  // Inspecter les matériaux des enfants du modèle
  mesh.traverse((child) => {
    if (child.isMesh) {
      console.log(child.material); // Affiche les matériaux appliqués
    }
  });
  // mesh.rotation.y = 0.1;
  scene.add(mesh);
});

// Définir un angle cible en radians (-Math.PI/4 = -45° vers la gauche)
const targetAngle = -Math.PI;
let animationActive = true;

let angle = 0; // Angle initial
const rotationSpeed = 0.02; // Vitesse de rotation

function animate() {
  requestAnimationFrame(animate);

  if (animationActive) {
    // Rotation progressive autour de l'objet
    if (angle > targetAngle) {
      angle -= rotationSpeed;
      camera.position.x = Math.cos(angle) * 20; // Rayon de rotation
      camera.position.z = Math.sin(angle) * 10;
      camera.lookAt(0, 0, 0); // Toujours regarder le centre de la scène
    } else {
      animationActive = false; // Stopper l'animation
    }
  }
  renderer.render(scene, camera);
}
animate();

//Importation des différentes peluches
function importerPeluches(url, position, scale = 0.2) {
  gltfLoader.load(url, (gltf) => {
    let peluche = gltf.scene;
    peluche.position.set(position.x, position.y, position.z), scale;
    scene.add(peluche);
  });
}

//Générer des peluches
let nombreOurs = 5;
for (let i = 0; i < nombreOurs; i++) {
  let posX = (Math.random() - 0.5) * 2; // Réduit la dispersion en X
  let posY = Math.random() * 10; // Position aléatoire en hauteur
  let posZ = (Math.random() - 0.5) * 4; // Réduit la dispersion en Z
  importerPeluches("./modeles/Ours.glb", { x: posX, y: posY, z: posZ }, 0, 5);
}

//Générer des peluches
let nombreLapin = 5;
for (let i = 0; i < nombreLapin; i++) {
  let posX = (Math.random() - 0.5) * 2; // Réduit la dispersion en X
  let posY = Math.random() * 10; // Position aléatoire en hauteur
  let posZ = (Math.random() - 0.5) * 4; // Réduit la dispersion en Z
  importerPeluches("./modeles/Lapin.glb", { x: posX, y: posY, z: posZ }, 0.5);
}
