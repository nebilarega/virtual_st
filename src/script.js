import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// global variables
let scene,
  canvas,
  camera,
  textureLoader,
  renderer,
  raycaster,
  pointer,
  mouseMove,
  gui;

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const initScene = () => {
  scene = new THREE.Scene();
  pointer = new THREE.Vector2();
  mouseMove = new THREE.Vector2();
  gui = new dat.GUI();

  // Textures
  textureLoader = new THREE.TextureLoader();
  textureLoader.load("/textures/emptyRoom.jpg", (texture) => {
    scene.background = texture;
  });

  // Canvas
  canvas = document.querySelector("canvas.webgl");
  camera = new THREE.PerspectiveCamera(
    120,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.x = 0;
  camera.position.y = 0;
  camera.position.z = 3;
  scene.add(camera);
  gui
    .add(camera.rotation, "y")
    .min(-Math.PI / 2)
    .max(Math.PI / 2)
    .step(0.0001)
    .name("Camera rotation");

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  raycaster = new THREE.Raycaster();
};
const initLight = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const light = new THREE.PointLight(0xffffff, 0.5);
  light.position.x = 2;
  light.position.y = 3;
  light.position.z = 4;
  scene.add(light);
};
const initMaterials = () => {
  const material = new THREE.MeshStandardMaterial();
  material.metalness = 0.7;
  material.roughness = 0.2;
  material.side = THREE.DoubleSide;

  const box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
  box.geometry.setAttribute(
    "uv2",
    new THREE.BufferAttribute(box.geometry.attributes.uv.array, 2)
  );
  scene.add(box);
};
const render = () => {};

/**
 * Sizes
 */

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let draggedObject = null;

window.addEventListener("pointerdown", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length > 0) {
    draggedObject = intersects[0].object;
  }
});
window.addEventListener("dblclick", (event) => {
  draggedObject = null;
});
window.addEventListener("mousemove", (event) => {
  mouseMove.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseMove.y = -(event.clientY / window.innerHeight) * 2 + 1;
});
function dragObjectFunction() {
  if (draggedObject != null) {
    raycaster.setFromCamera(mouseMove, camera);
    const found = raycaster.intersectObjects(scene.children, true);
    if (found.length > 0) {
      for (let o of found) {
        draggedObject.position.x = o.point.x;
      }
    }
  }
  renderer.render(scene, camera);
}

const animate = () => {
  dragObjectFunction();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

const start = () => {
  initScene();
  initLight();
  initMaterials();
  animate();
};

start();
