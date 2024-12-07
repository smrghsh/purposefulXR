import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import GUI from "lil-gui";
import SimplexNoise from "simplex-noise";

class Sakura {
  constructor(scene, quantity) {
    const textureLoader = new THREE.TextureLoader();
    const particleTexture = textureLoader.load("/images/flower.png");

    this.particlesGeometry = new THREE.BufferGeometry();
    this.count = 108;

    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = Math.random() * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
      // colors[i] = Math.random();
    }
    for (let i = 0; i < this.count; i++) {
      colors[i * 3] = 0.918; // R
      colors[i * 3 + 1] = 0.427; // G
      colors[i * 3 + 2] = 0.576; // B
    }
    // particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    this.particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    // Material
    this.particlesMaterial = new THREE.PointsMaterial();

    this.particlesMaterial.size = 0.6;
    // this.particlesMaterial.sizeAttenuation = true;
    // this.particlesMaterial.vertexColors = false;
    this.particlesMaterial.color = new THREE.Color("#ea6d93");

    this.particlesMaterial.transparent = true;
    this.particlesMaterial.alphaMap = particleTexture;
    // this.particlesMaterial.alphaTest = 0.01;
    // this.particlesMaterial.depthTest = true;
    // this.particlesMaterial.depthWrite = false;
    // this.particlesMaterial.blending = THREE.AdditiveBlending;

    this.particlesMaterial.vertexColors = true;

    // Points
    const particles = new THREE.Points(
      this.particlesGeometry,
      this.particlesMaterial
    );
    // rotate it 90degrees on the z axis
    // particles.rotation.z = -Math.PI / 2;
    scene.add(particles);
  }
  tick() {
    // for each particle, move the position to the right, strength according to the noise.
    // if it goes to far to the right, reset the position on the left
    const positions = this.particlesGeometry.attributes.position.array;
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const y = positions[i3 + 1];
      const z = positions[i3 + 2];

      const noise = simplex.noise3D(x * 0.01, y * 0.01, z * 0.01);
      positions[i3] += (noise - 0.5) * 0.01;
      // positions[i3 + 2] += noise * 0.01;
      positions[i3 + 1] -= parameters.windSpeed;

      if (positions[i3 + 1] < -1) {
        positions[i3 + 1] = 10;
      }
      // for x, if it's more than 3, reset it to -3
      if (positions[i3] > 5) {
        positions[i3] = -5;
      }
      if (positions[i3] < -5) {
        positions[i3] = 5;
      }
    }
    this.particlesGeometry.attributes.position.needsUpdate = true;
  }
}

/**
 * Debug
 */
// const gui = new GUI();

const parameters = {
  windSpeed: 0.004,
};
/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// particles.scale.set(10, 10, 10);
// scene.fog = new THREE.Fog(0xffffff, 0.1, 20);
/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);
// ambient

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
  50,
  sizes.width / sizes.height,
  0.1,
  100
);
// camera.position.z = 6;
// camera position x: -2.885025922302314, y: 2.7053404723351537, z: 4.5119572644683945
// samir likes these numbers
// camera.÷position.set(-2.885025922302314, 2.7053404723351537, 4.5119572644683945);
camera.position.set(-2.885025922302314, 0.7053404723351537, 4.5119572644683945);

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
let scrollY = window.scrollY;
window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  console.log(scrollY);
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
const planeGeometry = new THREE.PlaneGeometry(10, 10, 24, 48);
// const planeGeometry2 = new THREE.PlaneGeometry(100, 100, 77, 77);
const planeMaterial = new THREE.MeshLambertMaterial({
  wireframe: true,
  color: 0x87ceeb,
  // side: THREE.DoubleSide,
});
const planeMaterial2 = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  // side: THREE.DoubleSide,
});

// axes helper biotch
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// Manipulate the vertices of the plane geometry using simplex noise
const vertices = planeGeometry.attributes.position.array;
const scale = 0.3; // Adjust the height variation
for (let i = 0; i < vertices.length; i += 3) {
  const x = vertices[i];
  const y = vertices[i + 1];
  // Generate noise based on the x and y coordinates
  const z = simplex.noise2D(x * 0.2, y * 0.3) * scale;
  vertices[i + 2] = z; // Modify the z value to add height
}

// Update the geometry to reflect the changes
planeGeometry.attributes.position.needsUpdate = true;
planeGeometry.computeVertexNormals();

// Create the mesh
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
const plane2 = new THREE.Mesh(planeGeometry, planeMaterial2);
// Rotate the plane to make it horizontal
plane.rotation.x -= Math.PI / 2;
plane.rotation.z += Math.PI / 4;
plane2.rotation.x -= Math.PI / 2;
plane2.rotation.z += Math.PI / 4;
plane2.position.y -= 0.01;
// plane.scale.set(0.05, 0.1, 0.05);
// I ADD THE PLANE HERE!!!!!!
scene.add(plane);
scene.add(plane2);

const sakura = new Sakura(scene, 500);
// rotate it at make it floor
// put windSpeed in the debug GUI
// gui?.add(parameters, "windSpeed").min(0).max(5).step(0.01).name("Wind Speed");
const tick = () => {
  camera.position.z = 4 + scrollY * 0.001;
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  sakura.tick();
  // Render
  renderer.render(scene, camera);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
