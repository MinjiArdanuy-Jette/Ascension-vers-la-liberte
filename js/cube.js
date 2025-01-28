import * as THREE from "three";

//Scène et caméra
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / window.innerHeight,
  0.1,
  1000
);

//Rendu
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(render);
document.body.appendChild(renderer.domElement);

//Géométrie, mesh, matériel
//Cube vert fluo
const geometrie = new THREE.BoxGeometry(1, 1, 1);
const materiel = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometrie, materiel);
// scene.add(cube);

//Fonction pour faire des instances
function creerInstances(geometrie, color, x) {
  const materiel = new THREE.MeshPhongMaterial({ color });
  const cube = new THREE.Mesh(geometrie, materiel);
  scene.add(cube);
  cube.position.x = x;
  return cube;
}
//Listes des cubes
const cubes = [
  creerInstances(geometrie, 0x44aa88, 0),
  creerInstances(geometrie, 0x8844aa, -2),
  creerInstances(geometrie, 0xaa8844, 2),
];

camera.position.z = 5;

//Lumière dirrectionnelle
const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

//Fonction pour animer le cube
function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}

function render(temps) {
  temps *= 0.001; // convertir en secondes le temps
  cubes.forEach((cube, nombre) => {
    const vitesse = 1 + nombre * 0.1;
    const rotation = temps + vitesse;
    cube.rotation.x = rotation;
    cube.rotation.y = rotation;
  });
  renderer.render(scene, camera);

  requestAnimationFrame(render);
}
