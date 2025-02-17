import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
// import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// Scène, caméra et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / window.innerHeight,
  0.1,
  1000
);

// Positionner la caméra
camera.position.z = -17.2038809099845;
camera.position.y = 16.85847416954149;
camera.position.x = -0.06799774919210766;

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
let manette;

// GLTF Loader pour charger les modèles
const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/Machine-pince.glb", (gltf) => {
  const mesh = gltf.scene;
  manette = mesh.getObjectByName("Manette");

  scene.add(mesh);
});

//Contrôles de la manette
let manetteDroite = false;
let manetteGauche = false;
let manetteHaut = false;
let manetteBas = false;

// Écouter les événements de clavier
window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      manetteGauche = true;
      break;
    case "ArrowRight":
    case "d":
      manetteDroite = true;
      break;
    case "ArrowUp":
    case "w":
      manetteHaut = true;
      break;
    case "ArrowDown":
    case "s":
      manetteBas = true;
      break;
  }
  event.preventDefault(); // Empêche le défilement de la page
});

window.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      manetteGauche = false;
      break;
    case "ArrowRight":
    case "d":
      manetteDroite = false;
      break;
    case "ArrowUp":
    case "w":
      manetteHaut = false;
      break;
    case "ArrowDown":
    case "s":
      manetteBas = false;
      break;
  }
  event.preventDefault();
});

const angleOrigineManette = 0; // Angle de base sur l'axe z (à adapter selon ton modèle)
const vitesseRetour = 0.05; // Vitesse du retour progressif

// // Contrôles OrbitControls pour naviguer avec la souris
// const controls = new OrbitControls(camera, renderer.domElement);

// // Permet d'afficher la position de la caméra dans la console
// controls.addEventListener("change", () => {
//   console.log(
//     `Position de la caméra : x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`
//   );
// });

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

  // Ajuste selon les limites que tu souhaites
  const limiteGauche = -0.5; // Limite de rotation vers la gauche
  const limiteDroite = 0.5; // Limite de rotation vers la droite
  const limiteHaut = -0.5; // Limite de rotation vers le haut
  const limiteBas = 0.5; // Limite de rotation vers le bas

  // Déplacer la manette avec les touches fléchées gauche/droite
  if (manette) {
    if (manetteGauche) {
      manette.rotation.x -= 0.05; // Déplacement à gauche
      if (manette.rotation.x < limiteGauche) {
        manette.rotation.x = limiteGauche;
      }
    }
    if (manetteDroite) {
      manette.rotation.x += 0.05; // Déplacement à droite
      if (manette.rotation.x > limiteDroite) {
        manette.rotation.x = limiteDroite;
      }
    }

    if (manetteHaut) {
      manette.rotation.z -= 0.05; // Déplacement à droite
      if (manette.rotation.z < limiteHaut) {
        manette.rotation.z = limiteHaut;
      }
    }

    if (manetteBas) {
      manette.rotation.z += 0.05; // Déplacement à droite
      if (manette.rotation.z > limiteBas) {
        manette.rotation.z = limiteBas;
      }
    }
    console.log("Position de la manette : ", manette.position.x);

    // Retour progressif vers l'angle d'origine si aucune touche n'est enfoncée
    if (!manetteGauche && !manetteDroite) {
      if (manette.rotation.x > angleOrigineManette) {
        manette.rotation.x -= vitesseRetour;
        if (manette.rotation.x < angleOrigineManette) {
          manette.rotation.x = angleOrigineManette; // Corrige pour éviter de dépasser
        }
      } else if (manette.rotation.x < angleOrigineManette) {
        manette.rotation.x += vitesseRetour;
        if (manette.rotation.x > angleOrigineManette) {
          manette.rotation.x = angleOrigineManette; // Corrige pour éviter de dépasser
        }
      }
    }
    if (!manetteHaut && !manetteBas) {
      if (manette.rotation.z > angleOrigineManette) {
        manette.rotation.z -= vitesseRetour;
        if (manette.rotation.z < angleOrigineManette) {
          manette.rotation.z = angleOrigineManette;
        }
      } else if (manette.rotation.z < angleOrigineManette) {
        manette.rotation.z += vitesseRetour;
        if (manette.rotation.z > angleOrigineManette) {
          manette.rotation.z = angleOrigineManette;
        }
      }
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
