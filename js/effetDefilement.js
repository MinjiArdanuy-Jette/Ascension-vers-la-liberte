import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/********************* CRÉATION DE LA SCÈNE *********************/
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
camera.position.z = 6;

/********************* IMPORTATION DES PELUCHES *********************/
const gltfLoader = new GLTFLoader();
const peluches = [];
const modeles = ["Ours.glb", "Lapin.glb", "Chat.glb"];
const nombreLignes = 4;
const espaceColonnes = 3.5;
const espaceLignes = 2;

// Charger les modèles mais ne pas encore les ajouter à la scène
for (let i = 0; i < nombreLignes; i++) {
  for (let j = 0; j < 2; j++) {
    const modeleAleatoire = modeles[Math.floor(Math.random() * modeles.length)];
    gltfLoader.load(`./modeles/${modeleAleatoire}`, (gltf) => {
      const peluche = gltf.scene;
      peluche.scale.set(0.3, 0.3, 0.3);

      const groupePeluche = new THREE.Group();
      groupePeluche.add(peluche);

      groupePeluche.position.x = j === 0 ? -espaceColonnes : espaceColonnes;
      groupePeluche.position.y = i * espaceLignes + 5; // Positionner au-dessus de l'écran
      peluche.rotation.y = Math.random() * Math.PI;

      groupePeluche.userData.vitesseRotation = {
        x: Math.random() * 0.05 + 0.02,
        y: Math.random() * 0.05 + 0.02,
        z: Math.random() * 0.05 + 0.02,
      };

      peluches.push(groupePeluche);
    });
  }
}

/********************* SCROLL POUR FAIRE APPARAITRE ET DESCENDRE *********************/
let premierScroll = true; // Variable pour savoir si c'est le premier scroll

window.addEventListener("scroll", () => {
  if (premierScroll) {
    premierScroll = false; // Après le premier scroll, on met la variable à false

    // Ajouter les peluches à la scène lors du premier scroll
    peluches.forEach((groupePeluche) => {
      scene.add(groupePeluche);
    });
  }

  const scrollY = window.scrollY;
  const hauteurMax = document.documentElement.scrollHeight - window.innerHeight;
  const progressionScroll = Math.min(scrollY / hauteurMax, 1);

  peluches.forEach((groupePeluche, index) => {
    if (!groupePeluche) return;

    // Déplacer les peluches en fonction du scroll
    groupePeluche.position.y =
      index * espaceLignes - progressionScroll * (nombreLignes * espaceLignes);

    // Ajouter un effet de rotation
    groupePeluche.rotation.x += groupePeluche.userData.vitesseRotation.x;
    groupePeluche.rotation.y += groupePeluche.userData.vitesseRotation.y;
    groupePeluche.rotation.z += groupePeluche.userData.vitesseRotation.z;
    // **Gérer l'opacité pour disparition progressive**
    let opacite = Math.max(1 - (progressionScroll - 0.8) * 5, 0); // À partir de 80% du scroll
    groupePeluche.traverse((child) => {
      if (child.isMesh) {
        child.material.transparent = true;
        child.material.opacity = opacite;
      }
    });

    // **Ajouter / Retirer les peluches de la scène**
    if (progressionScroll >= 1) {
      scene.remove(groupePeluche); // Retirer quand on est tout en bas
    } else if (!scene.children.includes(groupePeluche)) {
      scene.add(groupePeluche); // Réajouter quand on remonte
    }
  });
});

/********************* ANIMATION *********************/
function animer() {
  requestAnimationFrame(animer);

  // Rendu de la scène
  renderer.render(scene, camera);
}

animer();

document.addEventListener("DOMContentLoaded", function () {
  let titres = document.querySelectorAll(".revelation-texte h2");

  // Préparation : découper chaque texte de titre en lettres
  titres.forEach((titre) => {
    let texte = titre.dataset.texte; // Texte à révéler
    titre.innerHTML = ""; // Vider le contenu actuel

    // Découper le texte en lettres et les ajouter dans des spans
    texte.split("").forEach((lettre) => {
      let span = document.createElement("span");
      span.textContent = lettre === " " ? "\u00A0" : lettre; // Gérer les espaces
      span.classList.add("lettre");
      titre.appendChild(span);
    });

    titre.dataset.revele = "false"; // Marqueur pour suivre l'état d'apparition
    titre.dataset.letterIndex = 0; // Pour suivre la progression des lettres
  });

  // Fonction pour révéler une lettre du titre
  function revelerLettre(titre) {
    let spans = titre.querySelectorAll("span");
    let lettreIndex = parseInt(titre.dataset.letterIndex);

    // Calculer la vitesse d'apparition (plus le titre est long, plus il faut de temps pour tout afficher)
    let delay = Math.max(40, 1000 / spans.length); // Plus le texte est long, plus le délai est long

    if (lettreIndex < spans.length) {
      spans[lettreIndex].classList.add("visible"); // Ajouter la classe 'visible' pour faire apparaître la lettre
      titre.dataset.letterIndex = lettreIndex + 1; // Incrémenter l'index de la lettre
      setTimeout(() => revelerLettre(titre), delay); // Planifier l'apparition de la prochaine lettre
    } else {
      titre.dataset.revele = "true"; // Marquer le titre comme révélé
    }
  }

  // Fonction pour gérer le scroll et la progression de l'apparition
  document.addEventListener("scroll", function () {
    let windowHeight = window.innerHeight;

    titres.forEach((titre) => {
      let rect = titre.getBoundingClientRect();

      // Si le titre est visible dans la fenêtre (à moitié visible)
      if (
        rect.top < windowHeight * 0.5 &&
        rect.bottom >= 0 &&
        titre.dataset.revele === "false"
      ) {
        // Lancer l'animation de chaque lettre lorsque le titre est visible
        revelerLettre(titre);
      }
    });
  });
});

const heureFond = document.getElementById("heureFond");
const maxMinutes = 12 * 60 + 12; // 12h12 en minutes (732 minutes)

window.addEventListener("scroll", () => {
  let scrollY = window.scrollY;
  let maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Progression de 0 à 1 sur tout le scroll
  let progression = Math.min(scrollY / maxScroll, 1);

  // Calcule le temps en minutes sur la base de la progression
  let minutesActuelles = Math.floor(progression * maxMinutes);
  let heures = Math.floor(minutesActuelles / 60);
  let minutes = minutesActuelles % 60;

  let heuresFormatees = heures.toString().padStart(2, "0");
  let minutesFormatees = minutes.toString().padStart(2, "0");

  heureFond.textContent = `${heuresFormatees}:${minutesFormatees}`;
});
