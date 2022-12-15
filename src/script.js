// use-strict
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import * as dat from "lil-gui";

/**
 * Base
 */
// global variables
let scene,
  canvas,
  camera,
  textureLoader,
  gltfLoader,
  fbxLoader,
  renderer,
  raycaster,
  pointer,
  mouseMove,
  gui,
  cameraHelper;
let draggedObject = null;
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const guiAdd = (object, folderName) => {
  // gui.distroy();
  // gui = new dat.GUI();
  const scaleParams = {
    scale: 0.001,
  };
  const setScale = (value) => {
    object.scale.set(value, value, value);
  };
  const folder = gui.addFolder(folderName);
  const postion = folder.addFolder("Position");
  const roatation = folder.addFolder("Rotation");
  const scale = folder.addFolder("Scale");
  postion
    .add(object.position, "y")
    .min(-10)
    .max(10)
    .step(0.0001)
    .name("Position Y");
  roatation
    .add(object.rotation, "z")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.0001)
    .name(`Rotation Y`);
  roatation
    .add(object.rotation, "y")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.0001)
    .name(`Roatation Z`);
  roatation
    .add(object.rotation, "x")
    .min(-Math.PI)
    .max(Math.PI)
    .step(0.0001)
    .name(`Rotation X`);
  scale
    .add(object.scale, "x")
    .min(0.0001)
    .max(0.01)
    .step(0.00001)
    .name(`Scale X`);
  scale
    .add(object.scale, "y")
    .min(0.0001)
    .max(0.01)
    .step(0.00001)
    .name(`Scale Z`);
  scale
    .add(object.scale, "z")
    .min(0.0001)
    .max(0.01)
    .step(0.00001)
    .name(`Scale Y`);
  scale
    .add(scaleParams, "scale")
    .min(0.0001)
    .max(0.01)
    .step(0.00001)
    .name("Scale Whole")
    .onChange(setScale);
  folder.close();
};
const initScene = () => {
  scene = new THREE.Scene();
  pointer = new THREE.Vector2();
  mouseMove = new THREE.Vector2();
  gui = new dat.GUI();

  // Textures
  textureLoader = new THREE.TextureLoader();
  textureLoader.load("./textures/emptyRoom.jpg", (texture) => {
    scene.background = texture;
  });
  fbxLoader = new FBXLoader();

  // Canvas
  canvas = document.querySelector("canvas.webgl");
  camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    100
  );
  camera.position.x = 0;
  camera.position.y = 1;
  camera.position.z = 3;
  scene.add(camera);
  cameraHelper = new THREE.CameraHelper(camera);
  // scene.add(cameraHelper);

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
const initModels = () => {
  fbxLoader.load(
    "./models/Table.fbx",
    (tableGroup) => {
      if (scene) {
        const table = tableGroup.children[0];
        table.scale.set(0.001, 0.001, 0.001);
        table.position.set(0, 0, 0);

        table.castShadow = true;
        table.receiveShadow = true;
        table.userData.draggble = true;
        table.userData.name = "TABLE";
        scene.add(table);
        guiAdd(table, "table");
      }
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    (error) => {
      console.log(error);
    }
  );
  fbxLoader.load("./models/Sofa.fbx", (sofaGroup) => {
    if (scene) {
      const sofa = sofaGroup.children[0];
      sofa.scale.set(0.001, 0.001, 0.001);
      sofa.position.set(0, 0, 0);

      sofa.castShadow = true;
      sofa.receiveShadow = true;
      sofa.userData.draggble = true;
      sofa.userData.name = "sofa";
      scene.add(sofa);
      guiAdd(sofa, "sofa");
    }
  });
};
const render = () => {};

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
      draggedObject.position.x = found[0].point.x;
      draggedObject.position.z = found[0].point.z;
      // for (let o of found) {
      //   // draggedObject.position.x = o.point.x;
      //   draggedObject.position.x = o.point.x;
      //   draggedObject.position.z = o.point.z;
      // }
    }
  }
  renderer.render(scene, camera);
}

const animate = () => {
  dragObjectFunction();
  camera.updateProjectionMatrix();
  cameraHelper.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

const start = () => {
  initScene();
  initLight();
  // initMaterials();
  initModels();
  animate();
};

start();
