
import * as THREE from 'three';
export default function terrain({geometry, noise2D, material}, {ox = 0, oz = 0, w, h, layers = [w/4, w/2, w]}) {
 // 2. Create the Plane
const vertices = geometry.attributes.position.array
 for (let i = 0; i < vertices.length; i += 3) {
     const layeredNoise = layers.reduce((acc, scale) => {
         return acc + noise2D((vertices[i] + ox) / scale, (vertices[i + 1] + oz) / scale) * Math.sqrt(scale*2);
     }, 0);
     vertices[i + 2] = layeredNoise; // Modify Z based on noise
 }
 

  
  
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.y = -Math.PI
  plane.rotation.x = Math.PI*0.5
  
 plane.position.x = -ox
  plane.position.z = oz
  
  return plane
}