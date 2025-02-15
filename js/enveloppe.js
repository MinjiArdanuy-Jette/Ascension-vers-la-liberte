import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let letterMesh;

// Scène, caméra et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / window.innerHeight,
  0.1,
  1000
);

// Rendu
const canvas = document.getElementById("machine-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Ajouter une lumière à la scène
const ambientLight = new THREE.AmbientLight("white", 3);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 2.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

let mixer; // Mixer pour gérer l'animation
let actions = []; // Tableau pour stocker les actions d'animation

// GLTF Loader pour charger les modèles
const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/enveloppe.glb", (gltf) => {
  const mesh = gltf.scene;
  letterMesh = mesh.getObjectByName("Lettre");
  if (letterMesh) {
    letterMesh.visible = false;
  } else {
    console.warn("La partie lettre n'a pas été trouvée");
  }
  scene.add(mesh);

  // Positionner le modèle dans l'espace 3D
  mesh.position.z = 1;

  // Positionner la caméra une fois le modèle chargé
  camera.position.set(
    4.466789108193653e-9,
    5.777279106948395,
    1.0172150680117593
  );
  camera.lookAt(mesh.position);

  // Si le modèle contient des animations
  if (gltf.animations && gltf.animations.length) {
    mixer = new THREE.AnimationMixer(mesh);

    // Parcourir les animations mais NE PAS LES JOUER TOUT DE SUITE
    actions = gltf.animations.map((clip) => {
      const action = mixer.clipAction(clip);
      action.loop = THREE.LoopOnce; // Ne pas boucler
      action.clampWhenFinished = true; // Arrêter sur la dernière image
      return action; // Ajouter au tableau d'actions
    });
  }
});

// Contrôles OrbitControls pour naviguer avec la souris
const controls = new OrbitControls(camera, renderer.domElement);

// Permet d'afficher la position de la caméra dans la console
controls.addEventListener("change", () => {
  console.log(
    `Position de la caméra : x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`
  );
});

// Fonction pour démarrer les animations quand tu veux
function startAnimation() {
  if (actions.length) {
    if (letterMesh) {
      letterMesh.visible = true; // Montrer la lettre au lancement
    }
    actions.forEach((action) => {
      action.reset(); // Repartir du début de l'animation
      action.play(); // Lancer l'animation
    });
  } else {
    console.warn("Aucune animation trouvée sur le modèle.");
  }
}

// Exemple : déclencher l'animation par un clic sur la page entière
window.addEventListener("click", () => {
  console.log("Animation déclenchée !");
  startAnimation();
});

// Fonction animate pour le rendu de la scène en continu
function animate() {
  requestAnimationFrame(animate);

  // Mettre à jour les animations si le mixer est défini
  if (mixer) {
    mixer.update(0.01); // Ajuste ici pour ralentir ou accélérer l'animation
  }

  renderer.render(scene, camera);
}
animate();
