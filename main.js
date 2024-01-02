import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import bumpy from './bumpy'
import cards from './cards';
const app = document.getElementById('app')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

bumpy({ app, scene, camera, renderer })

cards({ scene })


const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(1, 1, 1);
scene.add(light);
console.log(light)
camera.position.z = 50;
camera.position.y = 10

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true

  renderer.render(scene, camera);
}
const onResize = () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

window.addEventListener('resize', onResize);
animate();
