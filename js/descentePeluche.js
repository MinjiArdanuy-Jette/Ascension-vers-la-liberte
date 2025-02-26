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
const rendu = new THREE.WebGLRenderer({ antialias: true, alpha: true });
document.body.appendChild(rendu.domElement);
rendu.setSize(window.innerWidth, window.innerHeight);

const lumiereAmbiante = new THREE.AmbientLight("white", 2);
scene.add(lumiereAmbiante);
const lumiereDirectionnelle = new THREE.DirectionalLight("white", 1);
lumiereDirectionnelle.position.set(1, 1, 1);
scene.add(lumiereDirectionnelle);

camera.position.z = 6;

/********************* IMPORTATION DES PELUCHES *********************/
const chargeurGLTF = new GLTFLoader();
const peluches = [];
const modeles = ["Ours.glb", "Lapin.glb", "Chat.glb"];
const nombreLignes = 4;
const espaceColonnes = 3.5;
const espaceLignes = 2;

for (let i = 0; i < nombreLignes; i++) {
  for (let j = 0; j < 2; j++) {
    const modeleAleatoire = modeles[Math.floor(Math.random() * modeles.length)];
    chargeurGLTF.load(`./modeles/${modeleAleatoire}`, (gltf) => {
      const peluche = gltf.scene;
      peluche.scale.set(0.3, 0.3, 0.3);

      const groupePeluche = new THREE.Group();
      groupePeluche.add(peluche);

      groupePeluche.position.x = j === 0 ? -espaceColonnes : espaceColonnes;
      groupePeluche.position.y = i * espaceLignes;
      peluche.rotation.y = Math.random() * Math.PI;

      groupePeluche.userData.vitesseRotation = {
        x: Math.random() * 0.05 + 0.02,
        y: Math.random() * 0.05 + 0.02,
        z: Math.random() * 0.05 + 0.02,
      };

      scene.add(groupePeluche);
      peluches.push(groupePeluche);
    });
  }
}

/********************* SCROLL POUR FAIRE DESCENDRE *********************/
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const hauteurMax = document.documentElement.scrollHeight - window.innerHeight;
  const progressionScroll = Math.min(scrollY / hauteurMax, 1);

  peluches.forEach((groupePeluche, index) => {
    if (!groupePeluche) return;

    groupePeluche.position.y =
      index * espaceLignes - progressionScroll * (nombreLignes * espaceLignes);

    groupePeluche.rotation.x += groupePeluche.userData.vitesseRotation.x;
    groupePeluche.rotation.y += groupePeluche.userData.vitesseRotation.y;
    groupePeluche.rotation.z += groupePeluche.userData.vitesseRotation.z;
  });
});

/********************* ANIMATION *********************/
function animer() {
  requestAnimationFrame(animer);
  rendu.render(scene, camera);
}
animer();
