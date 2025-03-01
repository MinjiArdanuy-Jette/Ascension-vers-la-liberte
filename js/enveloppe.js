import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";

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
let mixer; //Animation de l'enveloppe
let actions = [];
let indexActionActuelle = 0;
let isZooming = false;
let zoomProgresse = 0;
const dureeZoom = 2;
const cibleZoom = new THREE.Vector3(0, 1.5475618749999955, 0.5);
let canvasJoue = true; // Contrôle la boucle d'animation

let animationJoue = false;
let texteOuvre = document.querySelector(".info-canvas-enveloppe");
let mesh;
let rotationFinale = false; // Déclenchement de la rotation
let rotationProgress = 0;
const rotationDuration = 1; // Durée de l'animation de rotation (en secondes)

/*********************APPARITION DU TITRE******************** */
document.addEventListener("DOMContentLoaded", () => {
  // Afficher le titre avec une animation
  titrePrincipal.classList.add("titre-visible");

  // Déclencher la disparition après 3 secondes
  setTimeout(() => {
    console.log("Titre va disparaitre automatiquement");

    titrePrincipal.classList.add("titre-disparait");
    titrePrincipal.classList.remove("titre-visible");

    setTimeout(() => {
      titrePrincipal.style.display = "none";
      animerEntreeEnveloppe();
    }, 50);
  }, 3000); // Durée avant disparition du titre en milisecondes
});
const phrases = [
  "Le moment est venu...",
  "Serai-je à la hauteur ? Je suis prête, mais pourquoi j'angoisse ?",
  "Tous les regards vont être rivés sur moi, des sourires bienveillants, des chuchotements et des silences...",
  "Il est temps d'ouvrir cette lettre. Ouvrons-là !",
];

let indexPhrase = 0;
const texteCanvas = document.querySelector(".info-canvas-enveloppe"); // L'élément où afficher les phrases

function afficherProchainePhrase() {
  if (indexPhrase < phrases.length) {
    let phrase = phrases[indexPhrase];
    let indexLettreActuel = 0;
    texteCanvas.textContent = ""; // Réinitialiser le contenu avant d'afficher une nouvelle phrase

    function afficherLettreParLettre() {
      if (indexLettreActuel < phrase.length) {
        texteCanvas.textContent += phrase[indexLettreActuel];
        indexLettreActuel++;
        setTimeout(afficherLettreParLettre, 100);
      } else {
        setTimeout(() => {
          indexPhrase++;
          afficherProchainePhrase();
        }, 2000);
      }
    }

    afficherLettreParLettre();
  } else {
    canvas.addEventListener("click", animerLettreClic);
  }
}

// Démarrer l'affichage des phrases
setTimeout(afficherProchainePhrase, 4000); // Début après 4 secondes

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

  mesh.visible = false; // Cache l'enveloppe au chargement

  camera.position.set(0, 5.777, 1.017);
  camera.lookAt(mesh.position);
  //Faire jouer les animatioins de l'enveloppe
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
    //Si toutes les animations sont terminées, alors ont zoom sur la lettre
    mixer.addEventListener("finished", animationTerminer);
  }
});

/*********************FONCTIONS POUR LANCER L'ANIMATIONI DE L'ENVELOPPE ******************** */

function animerEntreeEnveloppe() {
  let progression = 0;
  const duree = 0.2; // Durée de l'animation
  const positionDepart = 12; // Position de départ sous la scène
  const positionFinale = 1; // Position finale dans la scène

  mesh.visible = true; // Rendre l'enveloppe visible avant l'animation

  function animation() {
    if (progression < 1) {
      progression += clock.getDelta() / duree;
      progression = Math.min(progression, 1);

      const positionY = THREE.MathUtils.lerp(
        positionDepart,
        positionFinale,
        progression
      );
      mesh.position.z = positionY;

      requestAnimationFrame(animation);
    }
  }

  animation();
}

function commencerAnimationLettre() {
  if (actions.length) {
    indexActionActuelle = 0;
    jouerAnimationSuivante();
  }
}

function jouerAnimationSuivante() {
  if (indexActionActuelle < actions.length) {
    const action = actions[indexActionActuelle];
    action.reset();
    action.play();
  } else {
    console.log("Toutes les animations sont terminées !");
    debutZoom();
  }
}

function animationTerminer() {
  console.log(`Animation ${indexActionActuelle + 1} terminée`);
  indexActionActuelle++;
  jouerAnimationSuivante();
}

function debutZoom() {
  console.log("Début du zoom !");
  isZooming = true;
  zoomProgresse = 0;
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
      commencerAnimationLettre(); // Lancer l'animation après la rotation
    }
  }

  if (isZooming) {
    zoomProgresse += deltaTime / dureeZoom;
    zoomProgresse = Math.min(zoomProgresse, 1);

    camera.position.lerpVectors(
      new THREE.Vector3(0, 5.777, 1.017),
      cibleZoom,
      zoomProgresse
    );

    camera.lookAt(letterMesh.position);

    if (zoomProgresse >= 1) {
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
