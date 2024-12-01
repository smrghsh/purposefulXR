import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import SimplexNoise from "simplex-noise";

/**
 * Debug
 */
// const gui = new GUI();

const parameters = {
  windSpeed: 0.08,
};
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000);

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();
const particleTexture = textureLoader.load("/images/flower.png");

const particlesGeometry = new THREE.BufferGeometry();
const count = 500000;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 20;
  // colors[i] = Math.random();
}
for (let i = 0; i < count; i++) {
  colors[i * 3] = 0.918; // R
  colors[i * 3 + 1] = 0.427; // G
  colors[i * 3 + 2] = 0.576; // B
}
// particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);
particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

// Material
const particlesMaterial = new THREE.PointsMaterial();

particlesMaterial.size = 1;
// particlesMaterial.sizeAttenuation = true;
// particlesMaterial.vertexColors = false;
particlesMaterial.color = new THREE.Color("#ea6d93");

particlesMaterial.transparent = true;
particlesMaterial.alphaMap = particleTexture;
particlesMaterial.alphaTest = 0.01;
// particlesMaterial.depthTest = false;
// particlesMaterial.depthWrite = false;
particlesMaterial.blending = THREE.AdditiveBlending;

particlesMaterial.vertexColors = true;

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);
// particles.scale.set(10, 10, 10);
scene.fog = new THREE.Fog(0xffffff, 0.1, 20);
/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
// camera.position.z = 6;
// camera position x: -2.885025922302314, y: 2.7053404723351537, z: 4.5119572644683945
camera.position.set(-2.885025922302314, 2.7053404723351537, 4.5119572644683945);
cameraGroup.add(camera);

// Orbit Controls
// const controls = new THREE.OrbitControls(camera, canvas);
// controls.enableDamping = true;
const controls = new OrbitControls(camera, canvas);
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});
window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

// perlin noise
const simplex = new SimplexNoise();

// make a plane that is 100x100, wireframe, skyblue color, use the simplex noise to make it mountain terrain, add it to the scene
// Create the plane geometry
const planeGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: 0x87ceeb,
  side: THREE.DoubleSide,
});

// Manipulate the vertices of the plane geometry using simplex noise
const vertices = planeGeometry.attributes.position.array;
const scale = 10; // Adjust the height variation
for (let i = 0; i < vertices.length; i += 3) {
  const x = vertices[i];
  const y = vertices[i + 1];
  // Generate noise based on the x and y coordinates
  const z = simplex.noise2D(x * 0.02, y * 0.03) * scale;
  vertices[i + 2] = z; // Modify the z value to add height
}

// Update the geometry to reflect the changes
planeGeometry.attributes.position.needsUpdate = true;
planeGeometry.computeVertexNormals();

// Create the mesh
const plane = new THREE.Mesh(planeGeometry, planeMaterial);

// Rotate the plane to make it horizontal
plane.rotation.x = -Math.PI / 2;
plane.scale.set(0.05, 0.1, 0.05);
scene.add(plane);

// rotate it at make it floor
plane.rotation.x = Math.PI * 1.5;

// put windSpeed in the debug GUI
// gui?.add(parameters, "windSpeed").min(0).max(5).step(0.01).name("Wind Speed");
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // for each particle, move the position to the right, strength according to the noise.
  // if it goes to far to the right, reset the position on the left
  const positions = particlesGeometry.attributes.position.array;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = positions[i3];
    const y = positions[i3 + 1];
    const z = positions[i3 + 2];

    const noise = simplex.noise3D(x * 0.5, y * 0.1, z * 0.1);
    positions[i3] += (Math.abs(noise * 0.02) + 0.01) * parameters.windSpeed;
    positions[i3 + 1] += parameters.windSpeed * noise * 0.02;

    if (positions[i3] > 10) {
      positions[i3] = -10;
    }
  }
  particlesGeometry.attributes.position.needsUpdate = true;
  // particles.rotation.x = elapsedTime * 0.1;

  // Render
  renderer.render(scene, camera);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
