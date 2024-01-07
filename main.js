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
let ox = 0
let oz = 0
let map = new Map()
function createChunks(ox = 0, oy = 0){
  for(let y = -2; y < 2; y++){
    for(let x = -2; x < 2; x++){
      if(map.has(`${x-ox},${y+oy}`)) continue;
    const plane = terrain(noise2D, { scene, camera }, x*2048-ox*2048, y*2048+oy*2048, 2048, 2048, [512, 2048, 8192, 32768])
    map.set(`${x-ox},${y+oy}`, true)
    }
  }
}
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(1, 1, 1);
scene.add(light);
console.log(light)
camera.position.z = 50;
camera.position.y = 10


let t0, t1
let deltaTime = 0.001
function animate() {
  t0 = Date.now()
  requestAnimationFrame(animate);
  controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
  ox = Math.floor(camera.position.x/2048)
  oz = Math.floor(camera.position.z/2048)
  console.log(camera.position.x, camera.position.z, ox, oz)
  createChunks(ox, oz)
  bumpyPlane.material.uniforms.iTime.value += deltaTime/1000;
  renderer.render(scene, camera);
  t1 = Date.now()
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
