import './style.css'

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const app = document.getElementById('app')
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
const planeGeometry = new THREE.PlaneGeometry(100, 100, 6, 6)
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;

// Basic noise-like function
float pseudoNoise(vec3 point) {
    return fract(sin(dot(point.xyz, vec3(12.9898, 78.233, 45.5432))) * 43758.5453);
}

void main() {
    vUv = uv;

    // Modify the z position based on noise
    float noise = pseudoNoise(position);
    vec3 pos = position;
    pos.z += noise * 10.0; // Adjust the multiplier to change the height variation

    vNormal = normalMatrix * normal; // Transform the normal to camera space
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}`;

// Fragment shader (basic for now)
const fragmentShader = `
varying vec2 vUv;
varying vec3 vNormal;

void main() {
    // Simple directional light properties
    vec3 lightColor = vec3(1.0, 1.0, 1.0);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.75)); // Direction to the light source
    float ambientStrength = 0.1;

    // Ambient lighting
    vec3 ambient = ambientStrength * lightColor;

    // Diffuse lighting
    float diff = max(dot(vNormal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // Combine the two to get the final color
    vec3 finalColor = (ambient + diffuse) * vec4(vUv, 0.5, 1).xyz;

    gl_FragColor = vec4(finalColor, 1.0);
}`;


const planeMaterial = new THREE.ShaderMaterial({
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

plane.rotation.x= -Math.PI*0.5


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
