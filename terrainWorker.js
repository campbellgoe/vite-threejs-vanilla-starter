
import { createNoise2D } from 'simplex-noise';
const noise2D = createNoise2D();
function terrain(vertices, ox = 0, oz = 0, w, h, layers = [w/4, w/2, w]) {

 
  for (let i = 0; i < vertices.length; i += 3) {
      const layeredNoise = layers.reduce((acc, scale) => {
          return acc + noise2D((vertices[i] + ox) / scale, (vertices[i + 1] + oz) / scale) * Math.sqrt(scale*2);
      }, 0);
      vertices[i + 2] = layeredNoise; // Modify Z based on noise
  }
   geometry.computeVertexNormals(); // To smooth the shading
 
   const texture = new THREE.TextureLoader().load('/smooth+sand+dunes-2048x2048.jpg')
   texture.repeat.set(1, 1);
   // 4. Add the Plane to the Scene
   const material = new THREE.MeshStandardMaterial({
     color: 0xffffff,
     wireframe: false,
     map: texture,
 });
   const plane = new THREE.Mesh(geometry, material);
   plane.rotation.y = -Math.PI
   plane.rotation.x = Math.PI*0.5
   
  plane.position.x = -ox
   plane.position.z = oz
   
   return plane
 }
addEventListener('message', e => {
  const { noise2D, ox, oz, w, h, layers } = e.data;
  // Perform terrain generation here
  // Note: Since `noise2D` function and other dependencies can't be directly used in the worker,
  // you might need to implement them in the worker or find a way to pass necessary data to the worker.

  const vertices = []; // This should be the result of your terrain calculation
  for (let i = 0; i < 10; i++) {
    vertices.push(Math.random()); // Placeholder for actual terrain generation logic
  }
  // Once done, post the result back
  postMessage({ vertices });
});