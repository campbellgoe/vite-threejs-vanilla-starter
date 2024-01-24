import './style.css'

import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import bumpy from './bumpy'
import cards from './cards';
import terrain from './terrain';

import { createNoise2D } from 'simplex-noise';

function init(){
  const app = document.getElementById('app')
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  app.appendChild(renderer.domElement);

  const controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI/4
  controls.maxDistance = 1000
  const dirLight = new THREE.DirectionalLight(0xffeedd, 2);// dirLight.position = new THREE.Vector3(1, 1, 1)
    scene.add(dirLight)
  const {planeMaterial: seaMaterial } = bumpy({ app, scene, camera, renderer })
  seaMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight)
    // 3. Generate Simplex Noise
    const noise2D = createNoise2D();
  cards({ scene })
  let ox = 0
  let oz = 0
  let map = new Map()
  function createChunks(ox = 0, oy = 0, spread = 4){
    for(let y = -spread; y < spread; y++){
      for(let x = -spread; x < spread; x++){
        if(map.has(`${x-ox},${y+oy}`)) continue;
      const plane = terrain(noise2D, { scene, camera }, x*2048-ox*2048, y*2048+oy*2048, 2048, 2048, [512, 2048, 8192, 32768])
      map.set(`${x-ox},${y+oy}`, plane)
      }
    }
  }
  for(let y = -8; y < 8; y+=2){
    for(let x = -8; x < 8; x+=2){
  createChunks(x, y, 1)
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
    // requestAnimationFrame(animate);
    // controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
    ox = Math.floor(camera.position.x/2048)
    oz = Math.floor(camera.position.z/2048)
    // console.log(camera.position.x, camera.position.z, ox, oz)
    createChunks(ox, oz, 8)
    seaMaterial.uniforms.iTime.value += deltaTime/1000;
    renderer.render(scene, camera);
    t1 = Date.now()
    deltaTime = t1-t0
    const fps = 1000/(t1-t0)
  }
  controls.addEventListener("change", () => {
    animate()
  });
  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    seaMaterial.iResolution.value.set(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', onResize);
  animate();
  setTimeout(()=>{

    document.getElementById('progress').remove()
    animate()
  }, 1000)
}
init()
