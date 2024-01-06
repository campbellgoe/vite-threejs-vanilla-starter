
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

export default function terrain({ scene, camera }) {
  // 2. Create the Plane
  const geometry = new THREE.PlaneGeometry(2**13, 2**13, 256, 512*8); // 100 subdivisions

  // 3. Generate Simplex Noise
  const noise2D = createNoise2D();
  const vertices = geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    vertices[i + 2] = noise2D(vertices[i] / 100, vertices[i + 1] / 100) * 20; // Modify Z based on noise
  }

  geometry.computeVertexNormals(); // To smooth the shading

  // 4. Add the Plane to the Scene
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
  const plane = new THREE.Mesh(geometry, material);
  plane.rotation.y = -Math.PI
  plane.rotation.x = Math.PI*0.5
  const dirLight = new THREE.DirectionalLight(0xffeedd, 2);
  // dirLight.position = new THREE.Vector3(1, 1, 1)
  scene.add(dirLight)
  scene.add(plane);
  return plane
}