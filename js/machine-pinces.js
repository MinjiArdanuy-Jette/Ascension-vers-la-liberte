import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/*********************CRÉATION DE LA SCÈNE, DE LA CAMÉRA,  DU RENDU ET DE LA LUMIÈRE ******************** */
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
  antialias: true,
  canvas,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Ajouter une lumière à la scène
const ambientLight = new THREE.AmbientLight("white", 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight("white", 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

/*********************VARIABLES ******************** */
//Variable pour les éléments de la machine qui vont servir à interagir
let manette;
let railHorizontal;
let railVertical;
let plancher;

//Contrôles de la manette (boolean)
let manetteDroite = false;
let manetteGauche = false;
let manetteHaut = false;
let manetteBas = false;

const angleOrigineManette = 0; // Angle de base sur l'axe z (manette)
const vitesseRetour = 0.05; // Vitesse du retour progressif

//Permettre une seule direction
let directionActuelle = null;

const limitesRailHorizontal = {
  minX: 1, // Limite basse
  maxX: 7, // Limite haute
};

const limitesRailVertical = {
  minZ: -4, // Limite gauche
  maxZ: 4, // Limite droite
};

// Définir un angle cible en radians (-Math.PI/4 = -45° vers la gauche)
const angleCible = -Math.PI;
let animationActive = true;

let angle = 0; // Angle initial
const vitesseRotationMachine = 0.02; // Vitesse de rotation

// Ajuste selon les limites de la manette
const limiteGauche = -0.5; // Limite de rotation vers la gauche
const limiteDroite = 0.5; // Limite de rotation vers la droite
const limiteHaut = -0.5; // Limite de rotation vers le haut
const limiteBas = 0.5; // Limite de rotation vers le bas

/*********************IMPORTATION DE LA MACHINE À PINCES ******************** */
// GLTF Loader pour charger les modèles
const gltfLoader = new GLTFLoader();
gltfLoader.load("./modeles/Machine-pince.glb", (gltf) => {
  const mesh = gltf.scene;

  //Lier les variables à l'élément correspondant dans le modèle 3D
  manette = mesh.getObjectByName("Manette");
  railHorizontal = mesh.getObjectByName("Rail_horizontal");
  railVertical = mesh.getObjectByName("Rails_verticaux");
  plancher = mesh.getObjectByName("Plancher");

  if (plancher) {
    // console.log("Plancher trouvé :", plancher);
    let hauteurPlancher = plancher.position.y; // Récupérer la hauteur une fois le plancher trouvé
    // Génération des peluches (variables nommés ci-dessous - importation peluches)
    peluches.forEach(({ url, nombre, dispersionX, dispersionZ }) => {
      for (let i = 0; i < nombre; i++) {
        let posX = (Math.random() - 0.5) * dispersionX;
        let posY = hauteurPlancher + 1; //+1 pour pas que les peluches soient dans le plancher
        let posZ = (Math.random() - 0.5) * dispersionZ;
        importerPeluches(url, { x: posX, y: posY, z: posZ }, 0.5); //Fonction qui se trouve plus bas (importation Peluches)
      }
    });
  }
  scene.add(mesh);
});

/*********************ASSOCIER TOUCHES DU CLAVIER ET MANETTE (PIVOTER LA MANETTE)******************** */
// Écouter les événements de clavier - connaitre si les touches du clavier sont appuyées ou non
window.addEventListener("keydown", (event) => {
  if (directionActuelle) return;
  switch (event.key) {
    case "ArrowLeft":
    case "a":
      manetteGauche = true;
      directionActuelle = "gauche";
      break;
    case "ArrowRight":
    case "d":
      manetteDroite = true;
      directionActuelle = "droite";
      break;
    case "ArrowUp":
    case "w":
      manetteHaut = true;
      directionActuelle = "haut";
      break;
    case "ArrowDown":
    case "s":
      manetteBas = true;
      directionActuelle = "bas";
      break;
    case "Space":
      boutonPresse = true;
      break;
  }
  event.preventDefault(); // Empêche le défilement de la page
});

window.addEventListener("keyup", (event) => {
  switch (event.code) {
    case "ArrowLeft":
    case "a":
      manetteGauche = false;
      if (directionActuelle === "gauche") directionActuelle = null;
      break;
    case "ArrowRight":
    case "d":
      manetteDroite = false;
      if (directionActuelle === "droite") directionActuelle = null;
      break;
    case "ArrowUp":
    case "w":
      manetteHaut = false;
      if (directionActuelle === "haut") directionActuelle = null;
      break;
    case "ArrowDown":
    case "s":
      manetteBas = false;
      if (directionActuelle === "bas") directionActuelle = null;
      break;
    case "Space":
      boutonPresse = true;
      break;
  }
  event.preventDefault();
});

/*********************IMPORTATION PELUCHES ******************** */
// Stocke les positions des peluches déjà créées
const positionsPeluches = [];
// Importation des différentes peluches
function importerPeluches(url, position, echelle = 1) {
  gltfLoader.load(url, (gltf) => {
    let peluche = gltf.scene;
    peluche.position.set(position.x, position.y, position.z);
    peluche.scale.set(echelle, echelle, echelle);
    //Rotation aléatoire
    peluche.rotation.y = Math.random() * Math.PI * 2;
    peluche.rotation.x = Math.random() * 0.2 - 0.1;
    peluche.rotation.z = Math.random() * 0.2 - 0.1;

    // Vérifier que la peluche ne chevauche aucune autre
    let tropProche = false;
    const distanceMin = 1.5; // Définir la distance minimale entre les peluches
    for (let i = 0; i < positionsPeluches.length; i++) {
      const distance = Math.sqrt(
        Math.pow(position.x - positionsPeluches[i].x, 2) +
          Math.pow(position.y - positionsPeluches[i].y, 2) +
          Math.pow(position.z - positionsPeluches[i].z, 2)
      );

      if (distance < distanceMin) {
        tropProche = true;
        break;
      }
    }

    // Si trop proche, générer une nouvelle position
    if (tropProche) {
      // Régénérer la position de manière aléatoire
      position.x = (Math.random() - 0.5) * 5; // Changer les limites de dispersion si nécessaire
      position.z = (Math.random() - 0.5) * 5;
      importerPeluches(url, position, echelle); // Réessayer
      return;
    }

    // Ajouter la position de la peluche à la liste
    positionsPeluches.push(position);

    scene.add(peluche);
  });
}

// Données des peluches
const peluches = [
  {
    url: "./modeles/Ours.glb",
    nombre: 4,
    dispersionX: 2,
    dispersionZ: 2,
  },
  {
    url: "./modeles/Lapin.glb",
    nombre: 5,
    dispersionX: 4,
    dispersionZ: 2,
  },
  {
    url: "./modeles/Chat.glb",
    nombre: 5,
    dispersionX: 2,
    dispersionZ: 3,
  },
];

/*********************FONCTION POUR LES ÉLÉMENTS À ÊTRE MISE À JOUR ******************** */
function animate() {
  requestAnimationFrame(animate);
  //Rotation de la machine au chargement (on ne la voit pas)
  if (animationActive) {
    // Rotation progressive autour de l'objet
    if (angle > angleCible) {
      angle -= vitesseRotationMachine;
      camera.position.x = Math.cos(angle) * 20; // Rayon de rotation
      camera.position.z = Math.sin(angle) * 10;
      camera.lookAt(0, 0, 0); // Toujours regarder le centre de la scène
    } else {
      animationActive = false; // Stopper l'animation
    }
  }

  // Déplacer la manette avec les touches fléchées gauche/droite
  if (manette) {
    if (manetteGauche) {
      manette.rotation.x -= 0.05; // Déplacement à gauche
      if (railVertical.position.z > limitesRailVertical.minZ) {
        //Déplacer le rail horizontal à gauche
        railVertical.position.z -= 0.01;
      }
    }
    if (manetteDroite) {
      manette.rotation.x += 0.05; // Déplacement à droite
      if (railVertical.position.z < limitesRailVertical.maxZ) {
        //Déplacer le rail horizontal à droite
        railVertical.position.z += 0.01;
      }
      if (manette.rotation.x > limiteDroite) {
        manette.rotation.x = limiteDroite;
        console.log("Position de la manette : ", manette.position.x);
      }
    }

    if (manetteHaut) {
      manette.rotation.z -= 0.05; // Déplacement vers le haut
      if (railHorizontal.position.x < limitesRailHorizontal.maxX) {
        //Déplacer le rail horizontal vers le haut
        railHorizontal.position.x += 0.01;
      }
      if (manette.rotation.z < limiteHaut) {
        manette.rotation.z = limiteHaut;
        console.log("Position de la manette : ", manette.position.y);
      }
    }

    if (manetteBas) {
      manette.rotation.z += 0.05; // Déplacement vers le bas
      if (railHorizontal.position.x > limitesRailHorizontal.minX) {
        //Déplacer le rail horizontal vers le bas
        railHorizontal.position.x -= 0.01;
      }
      if (manette.rotation.z > limiteBas) {
        manette.rotation.z = limiteBas;
        console.log("Position de la manette : ", manette.position.y);
      }
    }

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
          manette.rotation.z = angleOrigineManette; // Corrige pour éviter de dépasser
        }
      } else if (manette.rotation.z < angleOrigineManette) {
        manette.rotation.z += vitesseRetour;
        if (manette.rotation.z > angleOrigineManette) {
          manette.rotation.z = angleOrigineManette; // Corrige pour éviter de dépasser
        }
      }
    }

    if (manette.rotation.x < limiteGauche) {
      manette.rotation.x = limiteGauche;
      console.log("Position de la manette : ", manette.position.x);
    }
  }

  renderer.render(scene, camera);
}
animate();
