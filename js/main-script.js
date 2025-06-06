
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import * as Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";

//////////////////////
/* GLOBAL CONSTANTS */
//////////////////////

const DOME_RADIUS = 100;
const RESOLUTION = 256;

const GEOMETRY = Object.freeze({
  dome: new THREE.SphereGeometry(DOME_RADIUS, 32, 32, 0, 2 * Math.PI, 0, Math.PI / 2),
  soil: new THREE.PlaneGeometry(DOME_RADIUS * 2, DOME_RADIUS * 2, RESOLUTION - 1, RESOLUTION - 1),
  moon: new THREE.SphereGeometry(5, 32, 32),
  ufoDisc: new THREE.SphereGeometry(1, 32, 32), //to be scaled
  ufoCockpit: new THREE.SphereGeometry(2, 32, 32),
  ufoLight: new THREE.CylinderGeometry(1.5, 1.5, 1, 32),
  ufoSphereLight: new THREE.SphereGeometry(0.5, 32, 32),
  houseWalls: createHouseWallsGeometry(),
  houseFrames: createHouseFramesGeometry(),
  houseDoor: createHouseDoorGeometry(),
  houseRoof: createHouseRoofGeometry(),
  houseWindows: createHouseWindowsGeometry(),
  treeFirstBranch: new THREE.CylinderGeometry(0.5, 0.5, 8, 12),
  treeSecondBranch: new THREE.CylinderGeometry(0.5, 0.5, 4, 12),
  treeCanopy: new THREE.SphereGeometry(1, 16, 16),
});

const MATERIAL = Object.freeze({
  moon: { //silver with silver light
    basic: new THREE.MeshBasicMaterial({ color: '#d2d6f3', emissive: '#d2d6f3' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#d2d6f3', emissive: '#d2d6f3' }),
    phong: new THREE.MeshPhongMaterial({ color: '#d2d6f3', emissive: '#d2d6f3'}),
    toon: new THREE.MeshToonMaterial({ color: '#d2d6f3', emissive: '#d2d6f3' }),
  },
  //
  ufoDisc: { //dark grey
    basic: new THREE.MeshBasicMaterial({ color: '#5b5b5b', shininess: 600 }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#5b5b5b', shininess: 600 }),
    phong: new THREE.MeshPhongMaterial({ color: '#5b5b5b', shininess: 600}),
    toon: new THREE.MeshToonMaterial({ color: '#5b5b5b', shininess: 600}),
  },
  //
  ufoCockpit: { //light grey with transparency and shiny
    basic: new THREE.MeshBasicMaterial({ color: '#dcdcdc', opacity: 0.5, shininess: 900, transparent: true }),
    gouraud: new THREE.MeshLambertMaterial({ color: '#dcdcdc', opacity: 0.5, shininess: 900, transparent: true }),
    phong: new THREE.MeshPhongMaterial({ color: '#dcdcdc', opacity: 0.5, shininess: 900, transparent: true }),
    toon: new THREE.MeshToonMaterial({ color: '#dcdcdc', opacity: 0.5, shininess: 900, transparent: true }),
  },
  //
  ufoLight: { //red with red light
    basic: new THREE.MeshBasicMaterial({ color: '#b30000', emissive: '#b30000' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#b30000', emissive: '#b30000' }),
    phong: new THREE.MeshPhongMaterial({ color: '#b30000', emissive: '#b30000' }),
    toon: new THREE.MeshToonMaterial({ color: '#b30000', emissive: '#b30000' }),
  },
  //
  ufoSphereLight: { //orange with orange light
    basic: new THREE.MeshBasicMaterial({ color: '#ff6300', emissive: '#ff6300' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#ff6300', emissive: '#ff6300' }),
    phong: new THREE.MeshPhongMaterial({ color: '#ff6300', emissive: '#ff6300' }),
    toon: new THREE.MeshToonMaterial({ color: '#ff6300', emissive: '#ff6300' }),
  },
  //
  houseWalls: { //white
    basic: new THREE.MeshBasicMaterial({ color: '#ffffff' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#ffffff' }),
    phong: new THREE.MeshPhongMaterial({ color: '#ffffff' }),
    toon: new THREE.MeshToonMaterial({ color: '#ffffff' }),
  },
  //
  houseRoof: { //terracota
    basic: new THREE.MeshBasicMaterial({ color: '#c06200' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#c06200' }),
    phong: new THREE.MeshPhongMaterial({ color: '#c06200' }),
    toon: new THREE.MeshToonMaterial({ color: '#c06200' }),
  },
  //
  houseFrames: { //blue
    basic: new THREE.MeshBasicMaterial({ color: '#6d99ff' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#6d99ff' }),
    phong: new THREE.MeshPhongMaterial({ color: '#6d99ff' }),
    toon: new THREE.MeshToonMaterial({ color: '#6d99ff' }),
  },
  //
  houseWindows: { //light grey with transparency
    basic: new THREE.MeshBasicMaterial({ color: '#dcdcdc', opacity: 0.75, transparent: true }),
    gouraud: new THREE.MeshLambertMaterial({ color: '#dcdcdc', opacity: 0.75, transparent: true }),
    phong: new THREE.MeshPhongMaterial({ color: '#dcdcdc', opacity: 0.75, transparent: true }),
    toon: new THREE.MeshToonMaterial({ color: '#dcdcdc', opacity: 0.75, transparent: true }),
  },
  //
  houseDoor: { //brown
    basic: new THREE.MeshBasicMaterial({ color: '#995623' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#995623' }),
    phong: new THREE.MeshPhongMaterial({ color: '#995623' }),
    toon: new THREE.MeshToonMaterial({ color: '#995623' }),
  },
  //
  treeFirstBranch: { //dark brown-orange
    basic: new THREE.MeshBasicMaterial({ color: '#A0522D' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#A0522D' }),
    phong: new THREE.MeshPhongMaterial({ color: '#A0522D' }),
    toon: new THREE.MeshToonMaterial({ color: '#A0522D' }),
  },
  //
  treeSecondBranch: { //dark brown-orange
    basic: new THREE.MeshBasicMaterial({ color: '#A0522D' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#A0522D' }),
    phong: new THREE.MeshPhongMaterial({ color: '#A0522D' }),
    toon: new THREE.MeshToonMaterial({ color: '#A0522D' }),
  },
  //
  treeCanopy: { //dark green
    basic: new THREE.MeshBasicMaterial({ color: '#004d00' }), 
    gouraud: new THREE.MeshLambertMaterial({ color: '#004d00' }),
    phong: new THREE.MeshPhongMaterial({ color: '#004d00' }),
    toon: new THREE.MeshToonMaterial({ color: '#004d00' }),
  }
});

const STAR_COUNT = 700;
const FLOWER_COUNT = 350;
const STAR_RADIUS = 0.05;
const FLOWER_RADIUS = 0.5;
const SOILMAP_PATH = './images/heightmap.png';

const AMBIENTLIGHT_INTENSITY = 0.1;
const DIRECTIONALLIGHT_INTENSITY = 0.3;

const UFOLIGHT_INTENSITY = 300;
const UFOLIGHT_ANGLE = Math.PI / 7;
const UFOLIGHT_PENUMBRA = 0.2;
const UFOSPHERELIGHT_COUNT = 8;
const UFOSPHERELIGHT_INTENSITY = 25;
const UFO_ELLIPSOID_SCALING = new THREE.Vector3(5, 1, 5);
const UFO_ANGULAR_VEL = (2 * Math.PI) / 8; 
const UFO_LINEAR_VEL = 8;

const MOON_COORDS = new THREE.Vector3(20, 45, 50);
const CLOCK = new THREE.Clock();
const keysPressed = new Set();

const ORBITAL_CAMERA = createPerspectiveCamera({
  fov: 72,
  near: 1,
  far: 400,
  x: -50,
  y: 30,
  z: -42,
});
const FIXED_CAMERA = createPerspectiveCamera({
  fov: 72,
  near: 1,
  far: 400,
  x: -50,
  y: 30,
  z: -42,
});

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

let renderer, scene, baseGroup, activeCamera = ORBITAL_CAMERA;
let orbitControls = null;

let sky, skyTexture, soil, soilTexture, soilGeometry; //textured meshes

let ufo, ufoLight, ufoSphereLights = [];

let meshes = []; //object meshes

// flags for event handlers
let updateProjectionMatrix = false;
let toggleActiveCamera = false;

// lights
let ambientLight, directionalLight, activeMaterial = 'phong'; // initial material
let newMaterial = false;
let directionalLightEnabled = true;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////

function createScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e4e09); // grass green
    baseGroup = createGroup({ y: -5, parent: scene });
    createSoil();
    createSkyDome();
    createLights();
    createMoon();
    createUfo();
    createHouse();
    scene.add(new THREE.AxesHelper(20));
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////

function createCameras() {
  const orbitControls = new OrbitControls(ORBITAL_CAMERA, renderer.domElement);
  orbitControls.target.set(0, -5, 0);
  orbitControls.keys = {
    LEFT: 72, // h
    UP: 75, // k
    RIGHT: 76, // l
    BOTTOM: 74, // j
  };
  orbitControls.update();
}

function createPerspectiveCamera({
  fov,
  near,
  far,
  x = 0,
  y = 0,
  z = 0,
  atX = 0,
  atY = 0,
  atZ = 0,
}) {
  const aspect = window.innerWidth / window.innerHeight;

  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(x, y, z);
  camera.lookAt(atX, atY, atZ);
  return camera;
}

function refreshCameraParameters(camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

function createLights() {
  ambientLight = new THREE.AmbientLight(0xd2d6f3, AMBIENTLIGHT_INTENSITY); //silver
  baseGroup.add(ambientLight);
  directionalLight = new THREE.DirectionalLight(0xd2d6f3, DIRECTIONALLIGHT_INTENSITY); //silver
  directionalLight.position.copy(MOON_COORDS);
  baseGroup.add(directionalLight);
}

/* ---------------------------------------------------------------------------------------------- */
/* ------------------------------------- CREATE OBJECT3D(S) ------------------------------------- */
/* ---------------------------------------------------------------------------------------------- */

function createSkyDome() {
  createSkyTexture();
  const material = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
  sky = new THREE.Mesh(GEOMETRY.dome, material);
  baseGroup.add(sky);
}

function createSkyTexture() {
  let size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, 0, size);
  gradient.addColorStop(0, '#000e40'); //deep blue
  gradient.addColorStop(1, '#140040'); //deep purple 

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < STAR_COUNT; i++) {
      let x = Math.random() * size;
      let y = Math.random() * size; //low probability of repeated coordinates
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, STAR_RADIUS, 0, Math.PI * 2);
      ctx.fill();
  }

  skyTexture = new THREE.CanvasTexture(canvas);
  skyTexture.needsUpdate = true;
}


async function createSoil() {
  soilGeometry = await createSoilGeometry(); //save geometry in global variable
  createSoilTexture();
  const material = new THREE.MeshStandardMaterial({ map: soilTexture, side: THREE.FrontSide });
  soil = new THREE.Mesh(soilGeometry, material);
  baseGroup.add(soil);
  createTrees();
}


async function createSoilGeometry() {
  const loader = new THREE.TextureLoader();
  const soilMap = await loader.loadAsync(SOILMAP_PATH); //load heightmap image
  const image = soilMap.image;
  const width = RESOLUTION;
  const height = RESOLUTION;

  // Read pixel data using canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height).data;

  // Create soil geometry
  const geometry = GEOMETRY.soil;
  geometry.rotateX(-Math.PI / 2);

  const vertices = geometry.attributes.position;
  for (let i = 0; i < vertices.count; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const pixelIndex = (y * width + x) * 4;
    const grayscale = imageData[pixelIndex];
    const heightValue = grayscale / ((RESOLUTION / 2) - 1) * 5; //bumpiness
    vertices.setY(i, heightValue);
  }

  vertices.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

function createSoilTexture() {
  let size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const flowerColors = ['#ffffff', '#00ffff', '#ffff00', '#ab4bff']; //white cyan yellow lilac

  ctx.fillStyle = '#1e4e09'; //grass green
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < FLOWER_COUNT; i++) {
    let x = Math.random() * size;
    let y = Math.random() * size; //low probability of repeated coordinates
    ctx.fillStyle = flowerColors[Math.floor(Math.random() * flowerColors.length)];
    ctx.beginPath();
    ctx.arc(x, y, FLOWER_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  soilTexture = new THREE.CanvasTexture(canvas);
  soilTexture.needsUpdate = true;
}

function createMoon() {
  const moon = createNamedMesh('moon', baseGroup);
  moon.position.copy(MOON_COORDS);
}

function createUfo() {
  ufo = new THREE.Group();
  ufo.position.set(0, 25, 0);
  baseGroup.add(ufo);

  const disc = createNamedMesh('ufoDisc', ufo);
  disc.scale.copy(UFO_ELLIPSOID_SCALING);
  const cockpit = createNamedMesh('ufoCockpit', ufo);
  cockpit.position.set(0, UFO_ELLIPSOID_SCALING.y / 2, 0);
  const light = createNamedMesh('ufoLight', ufo);
  light.position.set(0, -UFO_ELLIPSOID_SCALING.y, 0);
  const lightTarget = new THREE.Object3D();
  lightTarget.position.set(0, -10, 0);

  ufo.add(lightTarget);

  // red light
  ufoLight = new THREE.SpotLight(0xb30000, UFOLIGHT_INTENSITY, 0, UFOLIGHT_ANGLE, UFOLIGHT_PENUMBRA);
  ufoLight.position.copy(light.position);
  ufoLight.target = lightTarget;
  ufo.add(ufoLight);

  for (let i = 0; i < UFOSPHERELIGHT_COUNT; i++) {
    const sphereGroup = new THREE.Group();
    sphereGroup.rotation.set(0, (i * 2 * Math.PI) / UFOSPHERELIGHT_COUNT, 0);
    ufo.add(sphereGroup);

    const sphere = createNamedMesh('ufoSphereLight', sphereGroup);

    // calculate sphereX by subtracting the light radius and adding 1/2 of the 
    // sphere light radius to the disc ellipsoid radius
    const sphereX = - (UFO_ELLIPSOID_SCALING.x - 1.5 + 0.5 / 2);
    const sphereY = - UFO_ELLIPSOID_SCALING.y / 2;
    sphere.position.set(sphereX, sphereY, 0);

    const sphereLight = new THREE.PointLight(0xff0000, UFOSPHERELIGHT_INTENSITY, 30);
    sphereLight.position.set(sphereX, sphereY, 0);
    sphereGroup.add(sphereLight);
    ufoSphereLights.push(sphereLight);
  }
}

function createHouse() {
  const house = createGroup({ x: -25, y: 5, z: -15, parent: baseGroup });
  house.rotateY(Math.PI / 2);
  createNamedMesh('houseWalls', house);
  createNamedMesh('houseFrames', house);
  createNamedMesh('houseDoor', house);
  createNamedMesh('houseRoof', house);
  createNamedMesh('houseWindows', house);
}

function createHouseWallsGeometry() {
  return createHouseGeometry({
    vertices: [
      // front wall
      { x: 0, y: 0.5, z: -8 }, //v0 
      { x: 2, y: 0.5, z: -8 }, //v1
      { x: 4, y: 0.5, z: -8 }, //v2
      { x: 6, y: 0.5, z: -8 }, //v3
      { x: 8, y: 0.5, z: -8 }, //v4
      { x: 10, y: 0.5, z: -8 }, //v5 
      { x: 0, y: 1.5, z: -8 }, //v6 
      { x: 2, y: 1.5, z: -8 }, //v7
      { x: 4, y: 1.5, z: -8 }, //v8
      { x: 6, y: 1.5, z: -8 }, //v9
      { x: 8, y: 1.5, z: -8 }, //v10
      { x: 10, y: 1.5, z: -8 }, //v11 
      { x: 0, y: 3.5, z: -8 }, //v12 
      { x: 2, y: 3.5, z: -8 }, //v13
      { x: 4, y: 3.5, z: -8 }, //v14
      { x: 6, y: 3.5, z: -8 }, //v15
      { x: 8, y: 3.5, z: -8 }, //v16
      { x: 10, y: 3.5, z: -8 }, //v17 
      { x: 0, y: 5, z: -8 }, //v18 
      { x: 2, y: 5, z: -8  }, //v19 
      { x: 4, y: 5, z: -8 }, //v20
      { x: 6, y: 5, z: -8 }, //v21
      { x: 8, y: 5, z: -8 }, //v22
      { x: 10, y: 5, z: -8 }, //v23  
      
      //left wall
      { x: 0, y: 0.5, z: 0 }, //v24
      { x: 0, y: 0.5, z: -4 }, //v25
      { x: 0, y: 0.5, z: -8 }, //v26
      { x: 0, y: 5, z: 0 }, //v27
      { x: 0, y: 8, z: -4 }, //v28
      { x: 0, y: 5, z: -8 }, //v29

      //door wall
      { x: 10, y: 0.5, z: 0 }, //v30
      { x: 10, y: 8, z: -4 }, //v31 
      { x: 10, y: 0.5, z: -8 }, //v32 
      { x: 10, y: 5, z: 0 }, //v33 
      { x: 10, y: 5, z: -8 }, //v34 
      { x: 10, y: 0.5, z: -2.5 }, //v35
      { x: 10, y: 0.5, z: -5.5 }, //v36
      { x: 10, y: 3.5, z: -2.5 }, //v37
      { x: 10, y: 3.5, z: -5.5 }, //v38
      { x: 10, y: 4, z: -3 }, //v39
      { x: 10, y: 4, z: -5 }, //v40
      { x: 10, y: 6, z: -3 }, //v41
      { x: 10, y: 6, z: -5 }, //v42

      //back wall
      { x: 0, y: 0.5, z: 0}, //v43
      { x: 0, y: 5, z: 0}, //v44
      { x: 10, y: 0.5, z: 0}, //v45
      { x: 10, y: 5, z: 0}, //v46
    ],
    indexes: [
      // front wall
      [0, 6, 7],
      [0, 7, 1],
      [1, 7, 8],
      [1, 8, 2],
      [2, 8, 9],
      [2, 9, 3],
      [3, 9, 10],
      [4, 3, 10],
      [4, 10, 11],
      [4, 11, 5],
      [7, 6, 13],
      [6, 12, 13],
      [14, 9, 8],
      [9, 14, 15],
      [10, 16, 11],
      [11, 16, 17],
      [13, 12, 19],
      [12, 18, 19],
      [13, 19, 14],
      [19, 20, 14],
      [14, 20, 15],
      [15, 20, 21],
      [15, 21, 16],
      [16, 21, 22],
      [16, 22, 17],
      [17, 22, 23],
      //left wall
      [26, 24, 27],
      [29, 26, 27],
      [27, 28, 29],
      //door wall
      [30, 35, 37],
      [30, 37, 33],
      [37, 39, 33],
      [39, 41, 33],
      [41, 31, 33],
      [41, 42, 31],
      [31, 42, 34],
      [34, 42, 40],
      [40, 39, 38],
      [39, 37, 38],
      [40, 38, 34],
      [38, 32, 34],
      [38, 36, 32],
      //back wall
      [46, 43, 45],
      [44, 43, 46],
    ],
  });
}

function createHouseFramesGeometry() {
  return createHouseGeometry({
    vertices: [
      // front wall
      { x: 0, y: 0, z: -8 }, //v0 lower stripe
      { x: 0, y: 0.5, z: -8 }, //v1
      { x: 10, y: 0, z: -8 }, //v2
      { x: 10, y: 0.5, z: -8 }, //v3 
      { x: 2, y: 1.5, z: -8 }, //v4 right window
      { x: 2, y: 2, z: -8 }, //v5 
      { x: 2, y: 3, z: -8 }, //v6 
      { x: 2, y: 3.5, z: -8 }, //v7
      { x: 2.5, y: 2, z: -8 }, //v8
      { x: 2.5, y: 3, z: -8 }, //v9 
      { x: 4, y: 1.5, z: -8 }, //v10
      { x: 4, y: 2, z: -8 }, //v11 
      { x: 4, y: 3, z: -8 }, //v12 
      { x: 4, y: 3.5, z: -8 }, //v13
      { x: 3.5, y: 2, z: -8 }, //v14
      { x: 3.5, y: 3, z: -8 }, //v15 
      { x: 6, y: 1.5, z: -8 }, //v16 //left window
      { x: 6, y: 2, z: -8 }, //v17 
      { x: 6, y: 3, z: -8 }, //v18 
      { x: 6, y: 3.5, z: -8 }, //v19
      { x: 6.5, y: 2, z: -8 }, //v20
      { x: 6.5, y: 3, z: -8 }, //v21 
      { x: 8, y: 1.5, z: -8 }, //v22
      { x: 8, y: 2, z: -8 }, //v23 
      { x: 8, y: 3, z: -8 }, //v24 
      { x: 8, y: 3.5, z: -8 }, //v25
      { x: 7.5, y: 2, z: -8 }, //v26
      { x: 7.5, y: 3, z: -8 }, //v27 
      
      //left wall
      { x: 0, y: 0, z: 0 }, //v28 lower stripe
      { x: 0, y: 0.5, z: 0 }, //v29
      { x: 0, y: 0, z: -8 }, //v30
      { x: 0, y: 0.5, z: -8 }, //v31

      //door wall
      { x: 10, y: 0, z: 0 }, //v32 stripe frame (lower + door)
      { x: 10, y: 0.5, z: 0 }, //v33 
      { x: 10, y: 0, z: -2.5 }, //v34
      { x: 10, y: 0.5, z: -2.5}, //v35
      { x: 10, y: 0, z: -3}, //v36
      { x: 10, y: 3, z: -3}, //v37
      { x: 10, y: 3, z: -2.5}, //v38
      { x: 10, y: 3.5, z: -2.5}, //v39
      { x: 10, y: 3.5, z: -5.5}, //v40
      { x: 10, y: 3, z: -5}, //v41
      { x: 10, y: 3, z: -5.5 }, //v42
      { x: 10, y: 0, z: -5 }, //v43
      { x: 10, y: 0, z: -5.5 }, //v44
      { x: 10, y: 0.5, z: -5.5 }, //v45
      { x: 10, y: 0, z: -8 }, //v46
      { x: 10, y: 0.5, z: -8 }, //v47
      { x: 10, y: 4, z: -3}, //v48 top window
      { x: 10, y: 6, z: -3}, //v49
      { x: 10, y: 4, z: -5}, //v50
      { x: 10, y: 6, z: -5}, //v51
      { x: 10, y: 4.5, z: -3.5}, //v52
      { x: 10, y: 5.5, z: -3.5}, //v53
      { x: 10, y: 4.5, z: -4.5}, //v54
      { x: 10, y: 5.5, z: -4.5}, //v55
      { x: 10, y: 5.5, z: -5}, //v56
      { x: 10, y: 4.5, z: -5}, //v57
      { x: 10, y: 5.5, z: -3}, //v58
      { x: 10, y: 4.5, z: -3}, //v59
      
      //back wall
      { x: 0, y: 0, z: 0}, //v60
      { x: 0, y: 0.5, z: 0}, //v61
      { x: 10, y: 0, z: 0}, //v62
      { x: 10, y: 0.5, z: 0}, //v63
    ],
    indexes: [
      // front wall
      [0, 1, 2], //lower stripe
      [2, 1, 3], 
      //right window
      [4, 5, 11], 
      [4, 11, 10],
      [6, 13, 12],
      [6, 7, 13],
      [12, 14, 15],
      [12, 11, 14],
      [6, 9, 5],
      [5, 9, 8], 
      //left window
      [16, 23, 22], 
      [16, 17, 23],
      [18, 25, 24],
      [18, 19, 25],
      [18, 21, 17],
      [17, 21, 20],
      [24, 23, 27],
      [23, 26, 27], 
      //left wall
      [28, 29, 30], 
      [29, 31, 30],
      //door wall
      [33, 32, 34], 
      [33, 34, 35],
      [34, 36, 38],
      [36, 37, 38],
      [38, 40, 39],
      [40, 38, 42],
      [42, 41, 43],
      [42, 43, 44],
      [45, 44, 46],
      [45, 46, 47],
      // door wall window
      [48, 50, 57], 
      [57, 59, 48],
      [49, 56, 51],
      [49, 58, 56],
      [58, 59, 52],
      [58, 52, 53],
      [57, 56, 55],
      [55, 54, 57],
      //back wall
      [61, 60, 62], 
      [61, 62, 63],
    ],
  });
}

function createHouseDoorGeometry() {
  return createHouseGeometry({
    vertices: [
      //door wall
      { x: 10, y: 0, z: -3 }, //v0
      { x: 10, y: 3, z: -3 }, //v1 
      { x: 10, y: 0, z: -5 }, //v2 
      { x: 10, y: 3, z: -5 }, //v3 
    ],
    indexes: [
      [0, 2, 3],
      [3, 1, 0],
    ],
  });
}

function createHouseRoofGeometry() {
  return createHouseGeometry({
    vertices: [
      //front wall
      { x: 0, y: 5, z: -8 }, //v0
      { x: 10, y: 5, z: -8 }, //v1 
      { x: 0, y: 8, z: -4 }, //v2 
      { x: 10, y: 8, z: -4 }, //v3 
      //back wall
      { x: 0, y: 8, z: -4 }, //v4
      { x: 10, y: 8, z: -4 }, //v5 
      { x: 0, y: 5, z: 0 }, //v6 
      { x: 10, y: 5, z: 0 }, //v7 

    ],
    indexes: [
      [0, 2, 3],
      [1, 0, 3],
      [4, 6, 7],
      [5, 4, 7],
    ],
  });
}

function createHouseWindowsGeometry() {
  return createHouseGeometry({
    vertices: [
      //front wall
      { x: 2.5, y: 2, z: -8 }, //v0 right window
      { x: 2.5, y: 3, z: -8 }, //v1 
      { x: 3.5, y: 2, z: -8 }, //v2 
      { x: 3.5, y: 3, z: -8 }, //v3 
      { x: 6.5, y: 2, z: -8 }, //v4 left window
      { x: 6.5, y: 3, z: -8 }, //v5 
      { x: 7.5, y: 2, z: -8 }, //v6 
      { x: 7.5, y: 3, z: -8 }, //v7 
      //door wall
      { x: 10, y: 4.5, z: -3.5 }, //v8
      { x: 10, y: 5.5, z: -3.5 }, //v9
      { x: 10, y: 4.5, z: -4.5 }, //v10
      { x: 10, y: 5.5, z: -4.5 }, //v11

    ],
    indexes: [
      //front wall
      [0, 1, 2],
      [2, 1, 3],
      [4, 5, 6],
      [6, 5, 7],
      //door wall
      [9, 8, 10],
      [10, 11, 9],
    ],
  });
}

/**
 * Build one Y-shaped “sobreiro” (cork-oak) using exactly two cylinders and two ellipsoids:
 *
 *  • The first branch (length = 4) sits on the ground (y=0) and is tilted up by +θ.  
 *  • The second branch (length = 4) attaches halfway up the first branch and is tilted by –θ.  
 *  • One dark-green ellipsoid (“canopy”) goes at the tip of each branch.  
 *
 * No vertical trunk is used – the first cylinder itself is rooted at y=0.  
 * All branch-cylinders share the same dark brown-orange material; both canopies are dark green.
 *
 * Returns a THREE.Group whose local “ground” is at y=0.  The caller should position/rotate/scale it
 * in world space as needed (we’ll randomly rotate it around Y and position it on the terrain).
 */
function createTree() {
  const tree = new THREE.Group();

  // —————————————————————————————————————————————
  // 1) THE FIRST (LONG) BRANCH – LENGTH = 8, RADIUS = 0.5
  // —————————————————————————————————————————————
  const branchLen1 = 8;        // was 4, now doubled

  // Pick two tilt angles:
  //   • tilt1 between 20°–30° for the first branch
  //   • tilt2 = tilt1 + 20° (so second branch is more angled)
  const tilt1 = 0.1 + Math.random() * 0.1; // [0.20, 0.30] radians
  const tilt2 = tilt1 + 0.6;               // roughly [0.40, 0.50] radians

  // First branch:
  const firstBranch = createNamedMesh('treeFirstBranch', tree);
  firstBranch.rotation.z = +tilt1; // lean “forwards” by tilt1

  // Position its center so the bottom end touches local y=0:
  //   upVec1 = (0,1,0) rotated by +tilt1 around Z
  const upVec1 = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), tilt1);
  //   center1 = upVec1 * (branchLen1 / 2)
  const center1 = upVec1.clone().multiplyScalar(branchLen1 / 2);
  firstBranch.position.copy(center1);

  tree.add(firstBranch);

  // —————————————————————————————————————————————
  // 2) THE SECOND BRANCH – LENGTH = 4, RADIUS = 0.5
  //    Attaches halfway up the first branch, leans by –tilt2.
  // —————————————————————————————————————————————
  const branchLen2 = 4;
  
  const secondBranch = createNamedMesh('treeSecondBranch', tree);
  secondBranch.rotation.z = -tilt2; // lean “backwards” by tilt2

  // halfway1 = upVec1 * (branchLen1 * 0.5)
  const halfway1 = upVec1.clone().multiplyScalar(branchLen1 * 0.5);

  // upVec2 = (0,1,0) rotated by –tilt2 around Z
  const upVec2 = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(0, 0, 1), -tilt2);

  // center2 = halfway1 + upVec2 * (branchLen2 / 2)
  const center2 = halfway1.clone().add(upVec2.clone().multiplyScalar(branchLen2 / 2));
  secondBranch.position.copy(center2);

  tree.add(secondBranch);

  // —————————————————————————————————————————————
  // 3) TWO CANOPIES (ELLIPSOIDS) AT EACH BRANCH TIP
  // —————————————————————————————————————————————
  const canopy1 = createNamedMesh('treeCanopy', tree);
  canopy1.scale.set(1.5, 0.7, 1.5);
  // tip1Local = upVec1 * branchLen1
  const tip1Local = upVec1.clone().multiplyScalar(branchLen1);
  canopy1.position.copy(tip1Local);
  tree.add(canopy1);

  // (b) canopy at tip of secondBranch:
  const canopy2 = createNamedMesh('treeCanopy', tree);
  canopy2.scale.set(1.5, 0.7, 1.5);
  // tip2Local = halfway1 + upVec2 * branchLen2
  const tip2Local = halfway1.clone().add(upVec2.clone().multiplyScalar(branchLen2));
  canopy2.position.copy(tip2Local);
  tree.add(canopy2);

  return tree;
}

/**
 * Place exactly six instances of the above “sobreiro” onto the terrain.
 * Each tree’s (x,z) is chosen from a fixed array. We shoot a ray downward
 * to find the terrain’s y-coordinate, then place the tree so its local y=0
 * sits 0.01 units above the terrain (to avoid z-fighting). Finally, each
 * tree is given a random Y-rotation so they face different directions.
 */
function createTrees() {
  if (!soil) return;

  // Six fixed (x,z) positions – adjust as you like:
  const positions = [
    { x: -20, z: -40 },
    { x:  -5, z: -20 },
    { x:  15, z: -35 },
    { x: -25, z:  5 },
    { x:  10, z:  20 },
    { x:  30, z:   5 },
  ];

  const raycaster = new THREE.Raycaster();
  const down = new THREE.Vector3(0, -1, 0);

  for (let pos of positions) {
    // Raycast from high above (x,100,z) straight down:
    const origin = new THREE.Vector3(pos.x, 100, pos.z);
    raycaster.set(origin, down);
    const hits = raycaster.intersectObject(soil);
    if (hits.length === 0) continue;

    // Take the first intersection point as the ground:
    const groundPt = hits[0].point;

    // Build a new Y-shaped tree:
    const tree = createTree();
    
    // Randomly spin it around Y so they don’t all face the same way:
    tree.rotation.y = Math.random() * Math.PI * 2;

    // Place so that local y=0 is exactly at terrain’s y (+0.01 to avoid z-fighting):
    tree.position.set(groundPt.x, groundPt.y + 0.01, groundPt.z);

    // Add into baseGroup (which already has y = –5 from createScene):
    baseGroup.add(tree);
  }
}

////////////
/* UPDATE */
////////////

function handleUfoMovement(timeDelta) {
  // Build a 2D (X,Z) direction vector based on which arrows are down
  const dir = new THREE.Vector3();
  if (keysPressed.has('ArrowUp'))    dir.z += 1;
  if (keysPressed.has('ArrowDown'))  dir.z -= 1;
  if (keysPressed.has('ArrowLeft'))  dir.x += 1;
  if (keysPressed.has('ArrowRight')) dir.x -= 1;

  if (dir.lengthSq() > 0) {
    dir.normalize();
    // move at constant linear speed
    const step = UFO_LINEAR_VEL * timeDelta;
    dir.multiplyScalar(step);
    ufo.position.add(dir);
  }
}

function update(timeDelta) {
  //materials
  if (newMaterial) {
    newMaterial = false;
    meshes.forEach((mesh) => (mesh.material = mesh.userData.materials[activeMaterial]));
  }
  // cameras
  if (updateProjectionMatrix) {
    const isXrPresenting = renderer.xr.isPresenting;
    renderer.xr.isPresenting = false;
    updateProjectionMatrix = false;
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
      refreshCameraParameters(isXrPresenting ? renderer.xr.getCamera() : activeCamera);
    }
    renderer.xr.isPresenting = isXrPresenting;
  }
  if (toggleActiveCamera) {
    toggleActiveCamera = false;
    activeCamera = activeCamera == ORBITAL_CAMERA ? FIXED_CAMERA : ORBITAL_CAMERA;
    refreshCameraParameters(activeCamera);
  }

  // Rotate UFO
  ufo.rotation.y = (ufo.rotation.y + timeDelta * UFO_ANGULAR_VEL) % (2 * Math.PI);
  handleUfoMovement(timeDelta);

  if (activeCamera === ORBITAL_CAMERA && orbitControls)
    orbitControls.update();
}

/////////////
/* DISPLAY */
/////////////

function render() {
  renderer.render(scene, activeCamera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true, });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  renderer.xr.enabled = true;
  let button = VRButton.createButton(renderer);
  button.style.background = 'rgba(0,0,0,1)'; // make the button more visible
  document.body.appendChild(button);

  createScene();
  createCameras();

  // Event listeners for keypresses
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////

function animate() {
  const timeDelta = CLOCK.getDelta();
  update(timeDelta);
  render();
  renderer.setAnimationLoop(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////

function onResize() {
  updateProjectionMatrix = true;
}

//////////////////
/* KEY HANDLERS */
//////////////////

function onKeyDown(event) {
  keysPressed.add(event.key);
  switch (event.key.toLowerCase()) {
    case 'd':
      onKeyDownD();
      break;
    case 's':
      onKeyDownS();
      break;
    case 'p':
      onKeyDownP();
      break;
    case '1':
      onKeyDown1();
      break;
    case '2':
      onKeyDown2();
      break;
    case 'w':
      activeMaterial = 'phong';
      newMaterial = true;
      break;
    case 'q':
      activeMaterial = 'gouraud';
      newMaterial = true;
      break;
    case 'e':
      activeMaterial = 'toon';
      newMaterial = true;
      break;
    case 'r':
      activeMaterial = activeMaterial === 'basic' ? 'phong' : 'basic';
      newMaterial = true;
      break;
  }
}

// enable or disable directional light
function onKeyDownD() {
  directionalLightEnabled = !directionalLightEnabled;
  directionalLight.visible = directionalLightEnabled;
}

// enable or disable spotlight
function onKeyDownS() {
  ufoLight.visible = !ufoLight.visible;
}

// enable or disable point light
function onKeyDownP() {
    ufoSphereLights.forEach(light => {
        light.visible = !light.visible;
    });
}

// generate new soil texture
function onKeyDown1() {
  soil.clear();
  createSoilTexture();
  const material = new THREE.MeshStandardMaterial({ map: soilTexture, side: THREE.FrontSide });
  const mesh = new THREE.Mesh(soilGeometry, material); //geometry previously calculated
  soil.add(mesh);
}

// generate new sky texture
function onKeyDown2() {
  sky.clear();
  createSkyTexture();
  const material = new THREE.MeshBasicMaterial({ map: skyTexture, side: THREE.BackSide });
  const mesh = new THREE.Mesh(GEOMETRY.dome, material);
  sky.add(mesh);
}

function onKeyUp(event) {
  keysPressed.delete(event.key);
}

///////////////
/* UTILITIES */
//////////////

// create a THREE.Group on the given position and with the given scale.
// automatically adds the created Group to the given parent.
function createGroup({ x = 0, y = 0, z = 0, scale = [1, 1, 1], parent }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.scale.set(...scale);

  if (parent) { parent.add(group); } 
  else { scene.add(group); }
  return group;
}

// create a named mesh
function createNamedMesh(name, parent) {
  const materials = MATERIAL[name]; //all materials of object
  const mesh = new THREE.Mesh(GEOMETRY[name], materials[activeMaterial]);
  Object.assign(mesh.userData, { name, materials });
  meshes.push(mesh);
  parent.add(mesh);
  return mesh;
}

// create a geometry for the house with the given parameters
function createHouseGeometry({ vertices, indexes, scale = 1}) {
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indexes.flatMap((triangle) => triangle));
  
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      vertices.flatMap((vertex) => [vertex.x, vertex.y, vertex.z]).map((coord) => coord * scale),
      3
    )
  );

  geometry.computeVertexNormals();
  return geometry;
}

init();
animate();