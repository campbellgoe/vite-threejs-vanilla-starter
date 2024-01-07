
import * as THREE from 'three';

export default function bumpy({ scene }){
  const planeGeometry = new THREE.PlaneGeometry(1024, 1024, 100, 100)
const vertexShader = `
varying vec2 vUv;
varying vec3 vNormal;

uniform float iTime;
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
    pos.z += sin(iTime*0.1)*0.1;
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
  fragmentShader: fragmentShader,
  uniforms: {
    iTime: {
      value: 0
    }
  }
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

plane.rotation.x= -Math.PI*0.5
return plane
}