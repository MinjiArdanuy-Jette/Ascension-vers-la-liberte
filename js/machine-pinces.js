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
  canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Ajouter une lumière à la scène
const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// GLTF Loader pour charger les modèles
const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/Machine-pince.glb", (gltf) => {
  const mesh = gltf.scene.children[0];
  let manette = mesh.getObjectByName("Manette");
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

/*********************IMPORTATION PELUCHES ******************** */

// Importation des différentes peluches
function importerPeluches(url, position, scale = 1) {
  gltfLoader.load(url, (gltf) => {
    let peluche = gltf.scene;
    peluche.position.set(position.x, position.y, position.z);
    peluche.scale.set(scale, scale, scale);

    peluche.rotation.y = Math.random() * Math.PI * 2;
    peluche.rotation.x = Math.random() * 0.2 - 0.1;
    peluche.rotation.z = Math.random() * 0.2 - 0.1;

    // Créer un corps physique pour la peluche
    const peluchePhysique = new CANNON.Body({
      shape: new CANNON.Sphere(0.5 * scale), // Approximé par une sphère (tu peux ajuster la taille)
      mass: 5, // Masse de la peluche
    });

    peluchePhysique.position.set(position.x, position.y, position.z); // Position du corps physique
    monMonde.addBody(peluchePhysique); // Ajouter au monde physique

    // Lier l’objet Three.js au corps physique
    peluche.userData.physicsBody = peluchePhysique;

    scene.add(peluche);
  });
}

// Données des peluches
const peluches = [
  {
    url: "./modeles/Ours.glb",
    nombre: 2,
    dispersionX: 2,
    dispersionY: 8,
    dispersionZ: 2,
  },
  {
    url: "./modeles/Lapin.glb",
    nombre: 2,
    dispersionX: 5,
    dispersionY: 12,
    dispersionZ: 2,
  },
  {
    url: "./modeles/Chat.glb",
    nombre: 2,
    dispersionX: 2,
    dispersionY: 10,
    dispersionZ: 4,
  },
];

// Génération des peluches
peluches.forEach(({ url, nombre, dispersionX, dispersionY, dispersionZ }) => {
  for (let i = 0; i < nombre; i++) {
    let posX = (Math.random() - 0.5) * dispersionX;
    let posY = Math.random() * dispersionY;
    let posZ = (Math.random() - 0.5) * dispersionZ;
    importerPeluches(url, { x: posX, y: posY, z: posZ }, 0.5);
  }
});
