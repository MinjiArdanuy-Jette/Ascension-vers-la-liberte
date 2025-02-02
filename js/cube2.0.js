import * as THREE from "three";

// Scène, caméra et rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / window.innerHeight,
  0.1,
  1000
);

// Rendu
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(render);

// Géométrie, mesh, matériel
const geometrie = new THREE.BoxGeometry(1, 1, 1);
const materiel = new THREE.MeshPhongMaterial({ color: 0x00ff00 });

// Fonction pour faire des instances de cubes
function creerInstances(geometrie, color, x, y, z) {
  const materiel = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geometrie, materiel);
  scene.add(cube);
  cube.position.set(x, y, z);
  return cube;
}

// Liste des cubes
const cubes = [
  creerInstances(geometrie, 0x44aa88, 5, 0, 0), //placer le cube à droite
  // creerInstances(geometrie, 0x8844aa, -2),
  // creerInstances(geometrie, 0xaa8844, 2),
];
// Points A et B (limites de déplacement du cube)
const pointA = 5; // Position de départ du cube
const pointB = -5; // Position finale du cube

// Variable pour stocker la position cible du cube
let positionCible = pointA;

camera.position.z = 5;

// Fonction pour gérer le défilement (scroll)
function onScroll(event) {
  // Calculer la position cible en fonction du défilement
  if (event.deltaY > 0) {
    // Si l'utilisateur défile vers le bas, se déplacer vers la position B
    positionCible = pointB;
  } else if (event.deltaY < 0) {
    // Si l'utilisateur défile vers le haut, se déplacer vers la position A
    positionCible = pointA;
  }
}

// Écouter l'événement de défilement
window.addEventListener("wheel", onScroll, { passive: true });

// Lumière directionnelle
const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// Fonction de rendu
function render(temps) {
  temps *= 0.001; // Convertir en secondes le temps
  cubes.forEach((cube, nombre) => {
    const vitesse = 1 + nombre * 0.1; // Vitesse de rotation de chaque cube
    const rotation = temps + vitesse; // Rotation animée
    cube.rotation.x = rotation;
    cube.rotation.y = rotation;
    // L'interpolation ici pour déplacer lentement le cube vers la position cible
    cube.position.x = THREE.MathUtils.lerp(
      cube.position.x,
      positionCible,
      0.05
    ); // Valeur ajustée pour plus de fluidité
  });
  renderer.render(scene, camera);

  requestAnimationFrame(render); // Continuer l'animation
}

let arrPositionModel = [
  {
    id: "section-1",
    position: { x: 0, y: -1, z: 0 },
    rotation: { x: 0, y: 1.5, z: 0 },
  },
  {
    id: "section-",
    position: { x: 0, y: -1, z: 0 },
    rotation: { x: 0, y: 1.5, z: 0 },
  },
  {
    id: "section-1",
    position: { x: 0, y: -1, z: 0 },
    rotation: { x: 0, y: 1.5, z: 0 },
  },
];
