import './style.css'

import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import bumpy from './bumpy'
import cards from './cards';
import terrain from './terrain';
import {Sky} from './Sky';
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
  controls.maxPolarAngle = Math.PI/2.5
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
  const w = 2048
  const h = 2048
  const wSegments = 64
  const hSegments = 64
  
  const sandTexture = new THREE.TextureLoader().load('/smooth+sand+dunes-2048x2048.jpg')
  sandTexture.repeat.set(1, 1);
  // 4. Add the Plane to the Scene
  const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: false,
    map: sandTexture,
});
  function createChunks(ox = 0, oy = 0, spread = 4){
    for(let y = -spread; y < spread; y++){
      for(let x = -spread; x < spread; x++){
        if(map.has(`${x-ox},${y+oy}`)) continue;
        const planeGeometry = new THREE.PlaneGeometry(w, h, wSegments, hSegments);
      const plane = terrain({geometry: planeGeometry, material: terrainMaterial, noise2D}, {ox: x*w-ox*w, oz: y*h+oy*h, w, h, layers: [512, 2048, 8192, 32768]})
      map.set(`${x-ox},${y+oy}`, plane)
      scene.add(plane)
      plane.geometry.computeVertexNormals(); // To smooth the shading
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
  let sky, sunSphere;

  let sun;
  // Add Sky
  sky = new Sky();
  sky.scale.setScalar(450000);
  sky.updateMatrixWorld();
  // sky.matrixAutoUpdate = false;
  scene.add(sky);
  // Add Sun
  sunSphere = new THREE.Mesh(
    new THREE.SphereGeometry(20000, 16, 8),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
    })
  );
  // const skySettings = {
  //   turbidity: 12,
  //   rayleigh: 4,
  //   mieCoefficient: 0.0025,
  //   mieDirectionalG: 0.8,
  //   inclination: 0.2,
  //   azimuth: 0.4,
  //   sun: true,
  // };
  scene.add(sunSphere);
  sunSphere.updateMatrixWorld();
  sunSphere.matrixAutoUpdate = false;
  sunSphere.visible = false; //settings.sun;
  // const updateSkyAndSun = (settings) => {

  //     let uniforms = sky.material.uniforms;
  //     uniforms['turbidity'].value = settings.turbidity;
  //     uniforms['rayleigh'].value = settings.rayleigh;
  //     uniforms['mieCoefficient'].value = settings.mieCoefficient;
  //     uniforms['mieDirectionalG'].value = settings.mieDirectionalG;
  //     uniforms['sunPosition'].value.copy(sunSphere.position);

  //     let theta = Math.PI * (settings.inclination - 0.5);
  //     let phi = 2 * Math.PI * (settings.azimuth - 0.5);
  //     //console.log('PHI', phi);
  //     let distance = 7000;
  //     sunSphere.position.x = distance * Math.cos(phi);
  //     sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
  //     sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
  //     sun = {
  //       x: sunSphere.position.x,
  //       y: sunSphere.position.y,
  //       z: sunSphere.position.z,
  //       phi,
  //       theta,
  //       distance,
  //     };
  //   return sun;
  // };
  // sun = updateSkyAndSun(skySettings);
//  setupSkyLight(sun);

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
