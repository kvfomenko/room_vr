"use strict";

import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as UTILS from './utils.js'
import * as GAMEPAD from './gamepad.js'

//import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
//import * as THREE from '/js/three.js';
//import { VRButton } from '/js/VRButton.js';
//import { GLTFLoader } from '/js/GLTFLoader.js';
//import GLTFLoader from '/js/GLTFLoader.js';
//import { FirstPersonControls } from '/js/FirstPersonControls.js';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PI = Math.PI;
const PI2 = Math.PI * 2;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );
var gamepadState;

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.autoUpdate = true;
renderer.shadowMap.needsUpdate = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var lights = [];
function initLights() {
	const fogColor = new THREE.Color(0x666677);
	scene.background = fogColor;
	scene.fog = new THREE.Fog(fogColor, 0.0025, 20);

	/*const light0 = new THREE.AmbientLight( 0x404040 );
	scene.add( light0 );*/

	var light = new THREE.PointLight(0xffffff, 1, 10);
	light.position.set(3, 2, 2);
	light.castShadow = true;
	light.shadow.mapSize.width = 256;
	light.shadow.mapSize.height = 256;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 3;
	lights.push(light);
	scene.add(lights[0]);

	light = new THREE.PointLight(0xffffff, 1, 10);
	light.position.set(-3, 2, -4);
	light.castShadow = true;
	light.shadow.mapSize.width = 256;
	light.shadow.mapSize.height = 256;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 3;

	lights.push(light);
	scene.add(lights[1]);
}
initLights();

UTILS.draw_axis(scene,9, 3);

var cube, particleSystem;
function initGeometry() {
	const cubeTexture = new THREE.TextureLoader().load('/textures/3.png');
	const planeTexture = new THREE.TextureLoader().load('/textures/6.png');
	const particleTexture = new THREE.TextureLoader().load('/textures/snow2.png');

	const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
//const geometry = new THREE.SphereGeometry( 2, 6, 16 );
	const material = new THREE.MeshStandardMaterial({map: cubeTexture, transparent: false, color: 0xFFFFFF});
	cube = new THREE.Mesh(geometry, material);
	cube.castShadow = true;
	cube.receiveShadow = true;
	cube.position.z = -5;
	scene.add(cube);

// create an AudioListener and add it to the camera
	const listener = new THREE.AudioListener();
	camera.add(listener);
// create the PositionalAudio object (passing in the listener)
	const sound = new THREE.PositionalAudio(listener);
// load a sound and set it as the PositionalAudio object's buffer
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load('/audio/birds.mp3', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setRefDistance(1);
		sound.setDistanceModel('exponential');
		sound.setRolloffFactor(3);
		sound.setVolume(0.3);
		sound.play();
	});
	cube.add(sound);

//Create a plane that receives shadows (but does not cast them)
	const planeGeometry = new THREE.PlaneGeometry(50, 50, 5, 5);
	const planeMaterial = new THREE.MeshStandardMaterial({map: planeTexture, transparent: false, color: 0xffffff})
	const plane = new THREE.Mesh(planeGeometry, planeMaterial);
	plane.receiveShadow = true;
	plane.rotation.x = -PI / 2;
	plane.position.y = -3;
	scene.add(plane);


	let particles = new THREE.BufferGeometry;
	const particles_count = 500;
	let vertices = new Float32Array(particles_count * 3);
	for (let p = 0; p < particles_count * 3; p++) {
		vertices[p] = Math.random() * 10 - 5;
	}
	particles.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

	var particleMaterial = new THREE.PointsMaterial({map: particleTexture, transparent: true, size: 0.05});
	particleSystem = new THREE.Points(particles, particleMaterial);
	scene.add(particleSystem);
}
initGeometry();

/*const lightHelper = new THREE.PointLightHelper( light, 1, 0xffff00 );
scene.add(lightHelper);*/

var dolly, dolly_pos, dummyCam;
function initCamera() {
	renderer.xr.enabled = true;
	document.body.appendChild(VRButton.createButton(renderer));

	camera.position.set(0, 1.5, 0);
	camera.rotation.set(-PI / 8, 0, 0);

	dolly = new THREE.Object3D();
	dolly.position.set(0, 0, 0);
	dolly.add(camera);
	scene.add(dolly);

	dolly_pos = new THREE.Object3D();
	dummyCam = new THREE.Object3D();
	camera.add(dummyCam);
}
initCamera();

function loadObjects() {
	const loader = new GLTFLoader();
	loader.load('/models/portal_gun.gltf',
		function (gltf) {
			/*gltf.scene.scale.set(0.01, 0.01, 0.01);
			gltf.scene.position.set(0.5, -0.5, -0.5);*/
			gltf.scene.scale.set(0.3, 0.3, 0.3);
			gltf.scene.rotation.set(0, PI, 0);
			gltf.scene.position.set(0.8, -0.6, 0.1);
			camera.add(gltf.scene);
			//scene.add(gltf.scene);
		},
		undefined,
		function (error) {
			console.error(error)
		}
	)
}
loadObjects();

//console interface with text/buttons etc
/*const console_geometry = new THREE.BoxGeometry(3, 2, 0.1, 1, 1, 1);
const console_material = new THREE.MeshStandardMaterial({transparent: false,  color: 0x996666});
const console = new THREE.Mesh(console_geometry, console_material);
console.position.y = 1.5;
console.position.z = -1.5;
dolly.add(console);*/


//const controls = new OrbitControls(camera, renderer.domElement);
/*const personControls = new FirstPersonControls(camera, renderer.domElement);
personControls.lookSpeed = 0.1;
personControls.movementSpeed = 10;*/


const light_move_speed = 1; // meters per second
const cube_rotation_speed = 1/4; // rotations per second
function sceneUpdate(clockDelta) {
	cube.rotation.x += cube_rotation_speed * PI2 * clockDelta; // PI2 = 1 rotation per second
	cube.rotation.y += cube_rotation_speed * PI2 * clockDelta;
	particleSystem.rotation.y += PI/20 * clockDelta;

	var light_move = 0, light2_move = 0;
	if (lights[0].position.x >= 3) {
		light_move = -light_move_speed * clockDelta;
	}
	if (lights[0].position.x <= -3) {
		light_move = light_move_speed * clockDelta;
	}
	lights[0].position.x += light_move;

	if (lights[1].position.x >= 3) {
		light2_move = -light_move_speed * clockDelta;
	}
	if (lights[1].position.x <= -3) {
		light2_move = light_move_speed * clockDelta;
	}
	lights[1].position.x += light2_move;


	/*if (gamepadState.buttons[GAMEPAD.GAMEPAD_A]) {
		//shoot
	}*/
}


const dolly_move_speed = 6; // meters per second
const dolly_turn_speed = 0.5; // rotations per second
function gamepadUpdate(clockDelta) {
	/*let buttons = GAMEPAD.getButtons();
	let axes = GAMEPAD.getAxes();*/
	gamepadState = GAMEPAD.getAllState();
	//console.log('buttons: ' + buttons + ' axes: ' + axes);
	//console.log('rotation: ' + dolly.rotation.y);

	dolly_pos = dolly.position.clone();
	/*if (gamepadState.buttons[GAMEPAD.GAMEPAD_A]) {
		dolly_pos.z -= dolly_move_speed * clockDelta;
	}
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_B]) {
		dolly_pos.z += dolly_move_speed * clockDelta;
	}
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_C]) {
		dolly_pos.x -= dolly_move_speed * clockDelta;
	}
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_D]) {
		dolly_pos.x += dolly_move_speed * clockDelta;
	}*/
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_TURN_LEFT]) {
		//let turn_value = camera.rotation.y + PI2 * dolly_turn_speed * clockDelta;
		dolly.rotateY(PI2 * dolly_turn_speed * clockDelta);
		//camera.rotation.set(0, camera.rotation.y + PI2 * dolly_turn_speed * clockDelta, 0);
	}
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_TURN_RIGHT]) {
		//let turn_value = camera.rotation.y - PI2 * dolly_turn_speed * clockDelta;
		//camera.rotation.set(0, camera.rotation.y - PI2 * dolly_turn_speed * clockDelta, 0);
		dolly.rotateY(-PI2 * dolly_turn_speed * clockDelta);
	}

	/*if (gamepadState.axes[GAMEPAD.GAMEPAD_UP] > 0) {
		dolly_pos.z -= gamepadState.axes[GAMEPAD.GAMEPAD_UP] / 100 * dolly_move_speed * clockDelta;
	}
	if (gamepadState.axes[GAMEPAD.GAMEPAD_DOWN] > 0) {
		dolly_pos.z += gamepadState.axes[GAMEPAD.GAMEPAD_DOWN] / 100 * dolly_move_speed * clockDelta;
	}
	if (gamepadState.axes[GAMEPAD.GAMEPAD_LEFT] > 0) {
		dolly_pos.x -= gamepadState.axes[GAMEPAD.GAMEPAD_LEFT] / 100 * dolly_move_speed * clockDelta;
	}
	if (gamepadState.axes[GAMEPAD.GAMEPAD_RIGHT] > 0) {
		dolly_pos.x += gamepadState.axes[GAMEPAD.GAMEPAD_RIGHT] / 100 * dolly_move_speed * clockDelta;
	}*/

	dolly.position.copy(dolly_pos);

	//Store original dolly rotation
	const quaternion = dolly.quaternion.clone();
	//Get rotation for movement from the headset pose
	var worldQuaternion = dummyCam.getWorldQuaternion(new THREE.Quaternion());
	dolly.quaternion.copy(worldQuaternion);

	//dolly.quaternion.copy(dolly_pos.getWorldQuaternion());
	dolly.translateZ(-(gamepadState.axes[GAMEPAD.GAMEPAD_UP] - gamepadState.axes[GAMEPAD.GAMEPAD_DOWN])/100 * dolly_move_speed * clockDelta);
	dolly.translateX(-(gamepadState.axes[GAMEPAD.GAMEPAD_LEFT] - gamepadState.axes[GAMEPAD.GAMEPAD_RIGHT])/100 * dolly_move_speed * clockDelta);
	dolly.position.y = 0;
	dolly.quaternion.copy(quaternion);
}

const clock = new THREE.Clock(true);

function animate() {
	var clockDelta = clock.getDelta(); // seconds from prev frame

	sceneUpdate(clockDelta);
	gamepadUpdate(clockDelta);

	//controls.update();
	//personControls.update(clock.getDelta());
	renderer.render(scene, camera);
};

animate();

renderer.setAnimationLoop(animate);


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//personControls.handleResize();

	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);


