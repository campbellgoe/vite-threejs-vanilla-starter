import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import bumpy from './bumpy'
import cards from './cards';
import terrain from './terrain';

import { createNoise2D } from 'simplex-noise';

const app = document.getElementById('app')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const dirLight = new THREE.DirectionalLight(0xffeedd, 2);// dirLight.position = new THREE.Vector3(1, 1, 1)
  scene.add(dirLight)
const bumpyPlane = bumpy({ app, scene, camera, renderer })

  // 3. Generate Simplex Noise
  const noise2D = createNoise2D();
cards({ scene })

for(let y = 0; y < 10; y++){
  for(let x = 0; x < 10; x++){
  terrain(noise2D, { scene, camera }, x*1024, y*1024)
  }
}
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(1, 1, 1);
scene.add(light);
console.log(light)
camera.position.z = 50;
camera.position.y = 10


let t0, t1
let deltaTime = 0
function animate() {
  t0 = performance.now()
  requestAnimationFrame(animate);
  controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
  bumpyPlane.material.uniforms.iTime.value += deltaTime/100000000;
  renderer.render(scene, camera);
  t1 = performance.now()
  deltaTime = t1-t0
  const fps = 1000/(t1-t0)
}
const onResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onResize);
animate();
