import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/*********************DÉSACTIVATION DU SCROLL DE LA PAGE ******************** */
//Désactiver le scroll dès le chargement de la page
document.body.style.overflow = "hidden";

window.addEventListener("wheel", preventScroll, { passive: false });
window.addEventListener("keydown", preventScroll, { passive: false });

console.log("Scroll désactivé dès le chargement !");

//Fonction pour réactiver le scroll après la supression du canvas-enveloppe
function reactiverScroll() {
  console.log("Scroll réactivé après l'animation !");
  document.body.style.overflow = "";

  // Supprimer les écouteurs d'événements
  window.removeEventListener("wheel", preventScroll);
  window.removeEventListener("keydown", preventScroll);
}
/*********************VARIABLES ******************** */
let titrePrincipal = document.querySelector(".titre-site");
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
let texteOuvre = document.querySelector(".info-canvas-enveloppe");
let mesh;
let rotationFinale = false; // Déclenchement de la rotation
let rotationProgress = 0;
const rotationDuration = 1; // Durée de l'animation de rotation (en secondes)
/*********************CRÉATION DE LA SCÈNE, DE LA CAMÉRA, DU RENDU ET DE LA LUMIÈRE ******************** */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const canvas = document.getElementById("enveloppe-canvas");
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

/*********************IMPORTATION DE L'ENVELOPPE ******************** */

const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/enveloppe.glb", (gltf) => {
  mesh = gltf.scene;
  //Lier les variables à l'élément correspondant dans le modèle 3D
  letterMesh = mesh.getObjectByName("Lettre");

  scene.add(mesh);
  mesh.position.z = 1;
  mesh.rotation.z = Math.PI; //rotation de 180 degrés

  camera.position.set(0, 5.777, 1.017);
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

/*********************FONCTIONS POUR LANCER L'ANIMATIONI DE L'ENVELOPPE ******************** */

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

//Fonction pour jouer l'animation au clic du canvsa
function animerLettreClic() {
  if (!animationJoue) {
    animationJoue = true;
    rotationFinale = true;
    canvas.removeEventListener("click", animerLettreClic);
    texteOuvre.style.opacity = 0; //Enlever le texte à l'ouverture de l'enveloppe
  }
}
// Fonction pour bloquer le scroll clavier et souris
function preventScroll(event) {
  event.preventDefault();
}

canvas.addEventListener("click", animerLettreClic);

const clock = new THREE.Clock();

/*********************FONCTION POUR LES ÉLÉMENTS À ÊTRE MISE À JOUR ******************** */

function animate() {
  if (!canvasJoue) return;

  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();

  if (mixer) {
    mixer.update(deltaTime);
  }

  // Animation de la rotation Y de 180° vers 0°
  if (rotationFinale && mesh) {
    rotationProgress += deltaTime / rotationDuration;
    rotationProgress = Math.min(rotationProgress, 1);

    mesh.rotation.z = THREE.MathUtils.lerp(Math.PI, 0, rotationProgress);

    if (rotationProgress >= 1) {
      rotationFinale = false;
      startAnimation(); // Lancer l'animation après la rotation
    }
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

/*********************FONCTIONS POUR FAIRE DISPARAITRE LE CANVAS ******************** */
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

  // Supprimer le canvas
  if (canvas.parentNode) {
    canvas.parentNode.removeChild(canvas);
  }
  //Réactiver le scroll de la page
  reactiverScroll();
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
