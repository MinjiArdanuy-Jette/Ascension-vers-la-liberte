import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let letterMesh;
let mixer;
let actions = [];
let currentActionIndex = 0;
let isZooming = false;
let zoomProgress = 0;
const zoomDuration = 2;
const zoomTargetPosition = new THREE.Vector3(0, 1.5475618749999955, 0.5);
let canvasJoue = true; // Contrôle la boucle d'animation

let animationJoue = false;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const canvas = document.getElementById("enveloppe-canvas");
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const ambientLight = new THREE.AmbientLight("white", 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight("white", 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/enveloppe.glb", (gltf) => {
  const mesh = gltf.scene;
  letterMesh = mesh.getObjectByName("Lettre");

  scene.add(mesh);
  mesh.position.z = 1;

  camera.position.set(0, 5.777, 1.017);
  // camera.position.set(0, 2, 1.017);
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

    mixer.addEventListener("finished", onAnimationFinished);
  }
});

// // Contrôles OrbitControls pour naviguer avec la souris
// const controls = new OrbitControls(camera, renderer.domElement);

// // Permet d'afficher la position de la caméra dans la console
// controls.addEventListener("change", () => {
//   console.log(
//     `Position de la caméra : x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`
//   );
// });

function startAnimation() {
  if (actions.length) {
    currentActionIndex = 0;
    playNextAnimation();
  }
}

function playNextAnimation() {
  if (currentActionIndex < actions.length) {
    const action = actions[currentActionIndex];
    action.reset();
    action.play();
  } else {
    console.log("Toutes les animations sont terminées !");
    startZoom();
  }
}

function onAnimationFinished() {
  console.log(`Animation ${currentActionIndex + 1} terminée`);
  currentActionIndex++;
  playNextAnimation();
}

function startZoom() {
  console.log("Début du zoom !");
  isZooming = true;
  zoomProgress = 0;
}

function animerLettreClic() {
  if (!animationJoue) {
    animationJoue = true;
    startAnimation();
    window.removeEventListener("click", animerLettreClic);
  }
}

window.addEventListener("click", animerLettreClic);

const clock = new THREE.Clock();

function animate() {
  if (!canvasJoue) return;

  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (mixer) {
    mixer.update(deltaTime);
  }

  if (isZooming) {
    zoomProgress += deltaTime / zoomDuration;
    zoomProgress = Math.min(zoomProgress, 1);

    camera.position.lerpVectors(
      new THREE.Vector3(0, 5.777, 1.017),
      zoomTargetPosition,
      zoomProgress
    );

    camera.lookAt(letterMesh.position);

    if (zoomProgress >= 1) {
      isZooming = false;
      console.log("Zoom terminé !");
      nettoyerScene(); // Nettoyage ici
    }
  }

  renderer.render(scene, camera);
}

animate();

function nettoyerScene() {
  console.log("Nettoyage de la scène et arrêt du canvas...");
  canvasJoue = false; // Arrête la boucle d'animation

  // Libérer les ressources Three.js
  scene.traverse((object) => {
    if (object.isMesh) {
      object.geometry.dispose();
      nettoyerMateriau(object.materiel);
    }
  });

  // Supprimer l'écouteur d'événement si besoin
  window.removeEventListener("click", animerLettreClic);

  // Supprimer le canvas
  if (canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }

  // Optionnel : libérer mixer et autres variables
  mixer = null;
  actions = [];
  letterMesh = null;

  console.log("Canvas supprimé et ressources libérées.");
}

function nettoyerMateriau(materiel) {
  if (Array.isArray(materiel)) {
    materiel.forEach(nettoyerMateriau);
  } else {
    for (const key in materiel) {
      const value = materiel[key];
      if (value && typeof value.dispose === "function") {
        value.dispose();
      }
    }
  }
}
