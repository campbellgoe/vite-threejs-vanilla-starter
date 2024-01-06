
import * as THREE from 'three';
export default function terrain(noise2D, { scene, camera }, ox = 0, oz = 0) {
 // 2. Create the Plane
 const geometry = new THREE.PlaneGeometry(1024, 1024, 256, 256);

 const vertices = geometry.attributes.position.array;

 for (let i = 0; i < vertices.length; i += 3) {
     const layeredNoise = [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768].reduce((acc, scale) => {
         return acc + noise2D((vertices[i] + ox) / scale, (vertices[i + 1] + oz) / scale) * Math.sqrt(scale * 0.72);
     }, 0);
     vertices[i + 2] = layeredNoise; // Modify Z based on noise
 }
  geometry.computeVertexNormals(); // To smooth the shading

  // 4. Add the Plane to the Scene
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.y = -Math.PI
  plane.rotation.x = Math.PI*0.5
  
 plane.position.x = -ox
  plane.position.z = oz
  
  scene.add(plane);
  return plane
}