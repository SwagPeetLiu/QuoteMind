<template>
    <div ref="container" class="animation-container w-100 position-relative z-n1">
        <canvas ref="canvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { useStore } from 'vuex';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { config } from '@/config/config';

const container = ref(null);
const canvas = ref(null);
const store = useStore();

let scene, camera, renderer, controls;
let shapes = [];
let iteration = 0;

// dynamically determine the camera distance based on the screen width:
let cameraDistance;
if (window.innerWidth < 576) {
    cameraDistance = 8;
} 
else if (window.innerWidth >= 768 && window.innerWidth < 992) {
    cameraDistance = 10;
}
else if (window.innerWidth >= 992 && window.innerWidth < 1200) {
    cameraDistance = 7;
}
else {
    cameraDistance = 6;
}
const population = { x: 38, z: 38 };

const params = {
    speed: 0.3,
    noiseScale: 0.23,
    noiseAmp: 1.4,
};

let targetX = 0;
let targetY = 0;
let targetZ = 0;
const lerpFactor = 0.008;

// Reactive properties
const currentTheme = computed(() => store.state.themeColor);
const darkTheme = config.ChartColours.dark[1];

const colourPads = computed(() => ({
    primary: [...config.ChartColours.primary, darkTheme],
    info: [...config.ChartColours.info, darkTheme],
    success: [...config.ChartColours.success, darkTheme],
    warning: [...config.ChartColours.warning, darkTheme],
    danger: [...config.ChartColours.danger, darkTheme],
    dark: [...config.ChartColours.dark, darkTheme],
}));

const colorPalette = ref([]);

let currentColorIndex = 0;
let nextColorIndex = 1;
let colorT = 0;
const colorTransitionSpeed = 0.005;

// Update color palette function
function updateColorPalette() {
    colorPalette.value = [
        new THREE.Color(colourPads.value[currentTheme.value][0]),
        new THREE.Color(colourPads.value[currentTheme.value][1]),
        new THREE.Color(colourPads.value[currentTheme.value][2])
    ];
    // Reset color transition
    currentColorIndex = 0;
    nextColorIndex = 1;
    colorT = 0;
    // Update all existing particles with the new color palette
    shapes.forEach(shape => {
        shape.material.color.copy(colorPalette.value[currentColorIndex]);
    });
}

// Watch for theme changes
watch(currentTheme, () => {
    updateColorPalette();
});

// Custom noise function
function noise(x, y, z) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    const u = fade(x);
    const v = fade(y);
    const w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
        grad(p[BA], x - 1, y, z)),
        lerp(u, grad(p[AB], x, y - 1, z),
            grad(p[BB], x - 1, y - 1, z))),
        lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
            grad(p[BA + 1], x - 1, y, z - 1)),
            lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
                grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t, a, b) { return a + t * (b - a); }
function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h == 12 || h == 14 ? x : z;
    return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
}

const p = new Array(512);
for (let i = 0; i < 256; i++) p[i] = p[i + 256] = Math.floor(Math.random() * 256);

function createScene() {
    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true });
    renderer.setSize(width, height);

    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistance);
    scene.add(camera);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.minDistance = 4;
    controls.maxDistance = 20;
}

function Point(id) {
    this.id = id;
    this.speed = Math.random();
    this.geometry = new THREE.SphereGeometry(0.012, 32, 32);
    this.material = new THREE.MeshBasicMaterial({ 
        color: colorPalette.value[currentColorIndex],
        transparent: true,
        opacity: 0.8,
    });
    this.particle = new THREE.Mesh(this.geometry, this.material);
    this.dist = 1.8;
    this.u = Math.random();
    this.v = Math.random();
    const theta = 2 * Math.PI * this.u;
    const phi = Math.acos(2 * this.v - 1);
    this.particle.position.set(
        this.dist * Math.sin(phi) * Math.cos(theta),
        this.dist * Math.sin(phi) * Math.sin(theta),
        this.dist * Math.cos(phi)
    );
}

Point.prototype.move = function () {
    const time = iteration * params.speed * 0.01;
    this.dist = 1.8 + noise(time + this.particle.position.x * params.noiseScale,
        time + this.particle.position.y * params.noiseScale,
        time + this.particle.position.z * params.noiseScale) * params.noiseAmp;
    const theta = 2 * Math.PI * this.u;
    const phi = Math.acos(2 * this.v - 1);
    this.particle.position.set(
        this.dist * Math.sin(phi) * Math.cos(theta),
        this.dist * Math.sin(phi) * Math.sin(theta),
        this.dist * Math.cos(phi)
    );
    
    // Update color based on global color transition
    const currentColor = colorPalette.value[currentColorIndex];
    const nextColor = colorPalette.value[nextColorIndex];
    this.material.color.copy(currentColor).lerp(nextColor, colorT);
};

function createPoints() {
    for (let i = population.x * -0.5; i <= population.x / 2; i++) {
        for (let u = population.z * -0.5; u <= population.z / 2; u++) {
            const point = new Point(shapes.length, i, u);
            shapes.push(point);
            scene.add(point.particle);
        }
    }
}

function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    // Convert mouse position to spherical coordinates
    const phi = (mouseY * 0.5 + 0.5) * Math.PI;
    const theta = (mouseX * 0.5 + 0.5) * Math.PI * 2;

    // Calculate target camera position
    targetX = cameraDistance * Math.sin(phi) * Math.cos(theta);
    targetY = cameraDistance * Math.cos(phi);
    targetZ = cameraDistance * Math.sin(phi) * Math.sin(theta);

    // Lerp current camera position to target position
    camera.position.x += (targetX - camera.position.x) * lerpFactor;
    camera.position.y += (targetY - camera.position.y) * lerpFactor;
    camera.position.z += (targetZ - camera.position.z) * lerpFactor;

    // Make camera look at the center of the scene
    camera.lookAt(scene.position);
}

function animate() {
    iteration++;
    updateColors();
    requestAnimationFrame(animate);
    controls.update();
    shapes.forEach(shape => shape.move());
    renderer.render(scene, camera);
}

function updateColors() {
    colorT += colorTransitionSpeed;
    if (colorT >= 1) {
        colorT = 0;
        currentColorIndex = nextColorIndex;
        nextColorIndex = (nextColorIndex + 1) % colorPalette.value.length;
    }
}

function handleResize() {
    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

onMounted(() => {
    updateColorPalette(); // Initialize color palette
    createScene();
    createPoints();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onMouseMove);
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', onMouseMove);
    if (renderer) renderer.dispose();
});
</script>

<style scoped>
.animation-container {
    height: 500px;
    top: -10%;
    left: -5%;
}

/* Mobile devices */
@media (min-width: 300px) {
    .animation-container {
        height: 500px;
        top: -10%;
        left: -5%;
    }
}

/* Tablets */
@media (min-width: 768px) {
    .animation-container {
        height: 600px;
        top: -5%;
        left: -25%;
    }
}

/* Small laptops */
@media (min-width: 992px) {
    .animation-container {
        height: 400px;
        top: -10%;
        left: -5%;
    }
}

/* large laptops */
@media (min-width: 1200px) {
    .animation-container {
        height: 500px;
        top: -10%;
        left: -5%;
    }
}
</style>