
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';
import generateTexture from './canvas';
export default function cards({ scene }) {
  // const loader = new THREE.TextureLoader();


    // const cardTexture = loader.load('./frog-on-lilypad.webp'); // Replace with the path to your texture
const cardTexture = generateTexture()
const cardMaterial = new THREE.MeshStandardMaterial({ map: cardTexture })

// const roundedRectShape = new THREE.Shape();
// const x = 0, y = 0, width = 1, height = 1.4, radius = 0.06; // Adjust these values as needed

// roundedRectShape.moveTo(x, y + radius);
// roundedRectShape.lineTo(x, y + height - radius);
// roundedRectShape.quadraticCurveTo(x, y + height, x + radius, y + height);
// roundedRectShape.lineTo(x + width - radius, y + height);
// roundedRectShape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
// roundedRectShape.lineTo(x + width, y + radius);
// roundedRectShape.quadraticCurveTo(x + width, y, x + width - radius, y);
// roundedRectShape.lineTo(x + radius, y);
// roundedRectShape.quadraticCurveTo(x, y, x, y + radius);

// const cardGeometry = new THREE.ExtrudeGeometry(roundedRectShape, {
//     depth: 0.01,
//     bevelEnabled: false
// });
const cardGeometry = new RoundedBoxGeometry(1, 1.4, 0.05, 2, 0.05, 2, 2, 2, 2, 2)

const card = new THREE.Mesh(cardGeometry, cardMaterial)
scene.add(card)
return card
}