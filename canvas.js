
import * as THREE from 'three';export default function createCardTexture(){
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // Set canvas size
  canvas.width = 512;  // Set the width
  canvas.height = 512*1.4; // Set the height

  // Load a frog image
  const frogImage = new Image();
  const texture = new THREE.CanvasTexture(canvas);
  frogImage.onload = function() {
    context.fillStyle = 'green';
    context.fillRect(0, 0, canvas.width, canvas.height)
    const width = frogImage.naturalWidth
    const height = frogImage.naturalHeight
      // Draw the image onto the canvas when it's loaded
      context.drawImage(frogImage, 0, 0, canvas.width, canvas.height);
      // After drawing, update the texture
      texture.needsUpdate = true;
  };
  frogImage.src = '/frog-on-lilypad.webp'; // Replace with the path to your frog image
  return texture
}