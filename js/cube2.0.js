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
function creerInstances(geometrie, color, x) {
  const materiel = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geometrie, materiel);
  scene.add(cube);
  cube.position.x = x;
  return cube;
}

// Liste des cubes
const cubes = [
  creerInstances(geometrie, 0x44aa88, 0),
  creerInstances(geometrie, 0x8844aa, -2),
  creerInstances(geometrie, 0xaa8844, 2),
];

camera.position.z = 5;

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
  });
  renderer.render(scene, camera);

  requestAnimationFrame(render); // Continuer l'animation
}
