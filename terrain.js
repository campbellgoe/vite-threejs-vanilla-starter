
import * as THREE from 'three';
export default function terrain({geometry, noise2D, material, physicsWorld}, {ox = 0, oz = 0, w, h, layers = [w/4, w/2, w], wSegments, hSegments}) {
 // 2. Create the Plane
const vertices = geometry.attributes.position.array
const heightData = new Float32Array((wSegments + 1) * (hSegments + 1));
for (let i = 0, y = 0; y <= hSegments; y++) {
    for (let x = 0; x <= wSegments; x++, i += 3) {
        const vx = (x / wSegments - 0.5) * w;
        const vy = (y / hSegments - 0.5) * h;
        const layeredNoise = layers.reduce((acc, scale) => {
            return acc + noise2D((vx + ox) / scale, (vy + oz) / scale) * Math.sqrt(scale * 2);
        }, 0);
        vertices[i + 2] = layeredNoise; // Modify Z based on noise
        // Fill height data for Ammo.js
        heightData[y * (wSegments + 1) + x] = layeredNoise;
    }
}
 

const plane = new THREE.Mesh(geometry, material);
plane.rotation.y = -Math.PI
plane.rotation.x = Math.PI*0.5

plane.position.x = -ox
plane.position.z = -oz

    // Create Ammo.js heightfield physics shape
    const ammoHeightData = Ammo._malloc(heightData.length * heightData.BYTES_PER_ELEMENT);
    heightData.forEach((value, i) => {
        Ammo.HEAPF32[(ammoHeightData / 4) + i] = value; // Ensure correct indexing
    });

    const heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        wSegments + 1,
        hSegments + 1,
        ammoHeightData,
        1, // Scale
        Math.min(...heightData),
        Math.max(...heightData),
        1, // Up axis (Y)
        'PHY_FLOAT',
        false
    );

    const localInertia = new Ammo.btVector3(0, 0, 0);
    heightFieldShape.calculateLocalInertia(0, localInertia);

    const transform = new Ammo.btTransform();
transform.setIdentity();
transform.setOrigin(new Ammo.btVector3(ox, 0, oz));

// Initialize the quaternion to identity
let quat = new Ammo.btQuaternion();
// quat.setIdentity();

// Apply rotation around the X-axis to lay the terrain flat
quat.setRotation(new Ammo.btVector3(0, 0, 1), -Math.PI / 2);

transform.setRotation(quat);
const motionState = new Ammo.btDefaultMotionState(transform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, heightFieldShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    physicsWorld.addRigidBody(body);

    return { mesh: plane, physicsBody: body };
}