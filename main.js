import './style.css'
import Rand from 'rand-seed';
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js'
import bumpy from './bumpy'
import cards from './cards';
import terrain from './terrain';

import { createNoise2D } from 'simplex-noise';
let looping = true
const progressEl = document.getElementById('progress')
const getDistXZ = (posA, posB) => {
  return Math.sqrt((posB.x - posA.x)**2, (posB.z - posA.z)**2)
}
const randomSeed = 'hello world'
let physicsWorld;
function setupPhysicsWorld() {
    let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
        dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
        overlappingPairCache = new Ammo.btDbvtBroadphase(),
        solver = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -9.81, 0)); // Adjust gravity as needed
}
function init(){
  setupPhysicsWorld()
  const app = document.getElementById('app')
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  app.appendChild(renderer.domElement);

  const controls = new MapControls(camera, renderer.domElement);
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI/5
  controls.maxDistance = 3000
  controls.minDistance = 100
  const dirLight = new THREE.DirectionalLight(0xffeedd, 2);// dirLight.position = new THREE.Vector3(1, 1, 1)
    scene.add(dirLight)
  const {plane: seaMesh, planeMaterial: seaMaterial } = bumpy({ app, scene, camera, renderer })
  seaMaterial.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight)
    // 3. Generate Simplex Noise
    const rand = new Rand(randomSeed);
    const noise2D = createNoise2D(() => rand.next());
  const card = cards({ scene })
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
  function createChunks(ox = 0, oz = 0, spread = 4){
    const count = spread*4
    let i = 0
    for(let y = -spread; y < spread; y++){
      for(let x = -spread; x < spread; x++){
        if(map.has(`${x-ox},${y+oz}`)) continue;
        i++
        const planeGeometry = new THREE.PlaneGeometry(w, h, wSegments, hSegments);
      const {mesh:plane, physicsBody } = terrain({
        geometry: planeGeometry, material: terrainMaterial, noise2D, physicsWorld
      }, {ox: x*w-ox*w, oz: y*h+oz*h, w, h, layers: [512, 2048, 8192, 32768, 32768*4], wSegments, hSegments})
      map.set(`${x-ox},${y+oz}`, {mesh: plane, physicsBody})
      console.log('creating', x-ox, y+oz)
      progressEl.textContent = `Loading v${APP_VERSION} ${i/count*100}%`
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
  camera.position.y = 50
  // card.position.set(0, 0, -10); // Position the card in front of the camera

  // Add the card to the camera, not the scene
  // camera.add(card);

  // Make sure to add the camera to the scene
  scene.add(card);

  function createTestSphere() {
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32); // Radius set to 1, adjust as needed
    const sphereMaterial = new THREE.MeshStandardMaterial({color: 0xff0000});
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(0, 50, 0); // Start position, adjust Y value to be above the terrain

    scene.add(sphereMesh);

    // Create physics body for the sphere
    const sphereShape = new Ammo.btSphereShape(1); // Match the radius
    const sphereMass = 1; // Mass of 1 kg
    const sphereLocalInertia = new Ammo.btVector3(0, 0, 0);
    sphereShape.calculateLocalInertia(sphereMass, sphereLocalInertia);

    const sphereTransform = new Ammo.btTransform();
    sphereTransform.setIdentity();
    sphereTransform.setOrigin(new Ammo.btVector3(sphereMesh.position.x, sphereMesh.position.y, sphereMesh.position.z));
    const sphereMotionState = new Ammo.btDefaultMotionState(sphereTransform);
    const sphereRigidBodyInfo = new Ammo.btRigidBodyConstructionInfo(sphereMass, sphereMotionState, sphereShape, sphereLocalInertia);
    const sphereBody = new Ammo.btRigidBody(sphereRigidBodyInfo);
    sphereBody.setRestitution(0.6); // Example value, adjust as needed
    sphereBody.setFriction(1); // Example value, adjust as needed
    physicsWorld.addRigidBody(sphereBody);

    return {mesh: sphereMesh, body: sphereBody};
}
const transform = new Ammo.btTransform(); // Temporary object for reuse, avoid creating it in a loop

    const sphere = createTestSphere();
  const clock = new THREE.Clock()
  // const raycaster = new THREE.Raycaster();
  // let deltaTime = 0.001
  function animate() {
    // requestAnimationFrame(animate);
    // controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
    ox = Math.floor(camera.position.x/2048)
    oz = Math.floor(camera.position.z/2048)
    let deltaTime = clock.getDelta(); // Assuming you have a THREE.Clock instance
    physicsWorld.stepSimulation(deltaTime, 1);
    sphere.body.getMotionState().getWorldTransform(transform);
    const p = transform.getOrigin();
    const q = transform.getRotation();
    sphere.mesh.position.set(p.x(), p.y(), p.z());
    sphere.mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
    // console.log(camera.position.x, camera.position.z, ox, oz)
    createChunks(ox, oz, 8)
    seaMaterial.uniforms.iTime.value += deltaTime/1000;
    seaMesh.position.set(camera.position.x, seaMesh.position.y, camera.position.z)
  //   const cardPosition = new THREE.Vector3();
  //   camera.getWorldPosition(cardPosition);
  
  //   // Set the raycaster to cast from the card's position downwards
  //   // raycaster.set(cardPosition, new THREE.Vector3(0, -1, 0));
  //   raycaster.setFromCamera({ x: 0, y: 0 }, camera)
  // // const plane = map.get(`${ox},${oz}`)
  //   // Perform the raycast
  //   const intersects = raycaster.intersectObjects(scene.children , true);
  
  //   // Check if there are any intersections with the terrain
  //   if (intersects.length > 0) {
  //     // Move the card to the intersection point, with a slight offset if desired
  //     const closestIntersection = intersects[0];
  //     card.position.set(closestIntersection.point.x, closestIntersection.point.y, closestIntersection.point.z); // Adjust the '+ 1' offset as needed
  //     card.lookAt( camera.position );
  //   }
if(Math.random()>0.95){
    map.forEach(({mesh: plane, physicsBody}, coordsStr) => {
      const dist = getDistXZ(plane.position, camera.position)
      // console.log(dist)
      if(dist > 2**15){
        // console.log('too far')
        plane.geometry.dispose()
        plane.material.dispose()
        physicsWorld.removeRigidBody(physicsBody);
        Ammo.destroy(physicsBody);
        map.delete(coordsStr)
        console.log('deleting', coordsStr)
      }
    })
  }
    renderer.render(scene, camera);
    if(looping){
      requestAnimationFrame(animate)
    }
  }
  // controls.addEventListener("change", () => {
  //   animate()
  // });
  const onResize = () => {
    seaMaterial?.iResolution?.value.set(window.innerWidth, window.innerHeight)
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  window.addEventListener('resize', onResize);
  setTimeout(()=>{
    progressEl.remove()
  }, 1000)
  
  return animate
}
Ammo().then( function ( AmmoLib ) {

  Ammo = AmmoLib;

  const animate = init()
  animate()

} );
