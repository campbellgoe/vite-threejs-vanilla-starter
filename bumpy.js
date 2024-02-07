
import * as THREE from 'three';

export default function bumpy({ scene }){
  const planeGeometry = new THREE.PlaneGeometry(1024**4, 1024**4, 256, 256)
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
uniform vec2 iResolution;
uniform float iTime;


//Calculate the squared length of a vector
float length2(vec2 p){
    return dot(p,p);
}

//Generate some noise to scatter points.
float noise(vec2 p){
	return fract(sin(fract(sin(p.x) * (43.13311)) + p.y) * 31.0011);
}

float worley(vec2 p) {
    //Set our distance to infinity
	float d = 1e30;
    //For the 9 surrounding grid points
	for (int xo = -1; xo <= 1; ++xo) {
		for (int yo = -1; yo <= 1; ++yo) {
            //Floor our vec2 and add an offset to create our point
			vec2 tp = floor(p) + vec2(xo, yo);
            //Calculate the minimum distance for this grid point
            //Mix in the noise value too!
			d = min(d, length2(p - tp - noise(tp)));
		}
	}
	return 3.0*exp(-4.0*abs(2.5*d - 1.0));
}

float fworley(vec2 p) {
    //Stack noise layers 
	return sqrt(sqrt(sqrt(
		worley(p*5.0 + 0.05*iTime) *
		sqrt(worley(p * 50.0 + 0.12 + -0.1*iTime)) *
		sqrt(sqrt(worley(p * -10.0 + 0.03*iTime))))));
}
void main() {
  //Calculate an intensity
  float t = fworley(vUv * iResolution.xy / 15000.0);
  //Add some gradient
  t*=exp(-length2(abs(0.7*vUv - 1.0)));	
  //Make it blue!
  gl_FragColor = vec4(t * vec3(0.3, 1.3*t, pow(t*1.5, 0.5-t)), 0.7);
}

`;


const planeMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    iTime: {
      value: 0
    },
    iResolution:  { value: new THREE.Vector2() },
  },
  transparent: true,
  opacity: 0.7
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

plane.rotation.x= -Math.PI*0.5
return {plane, planeMaterial}
}