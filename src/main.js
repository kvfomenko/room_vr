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

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.shadowMap.autoUpdate = true;
renderer.shadowMap.needsUpdate = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const fogColor = new THREE.Color(0x666677);
scene.background = fogColor;
scene.fog = new THREE.Fog(fogColor, 0.0025, 10);

/*const light0 = new THREE.AmbientLight( 0x404040 );
scene.add( light0 );*/

const light = new THREE.PointLight( 0xffffff, 1, 10 );
light.position.set( 3, 2, 2 );
light.castShadow = true;
light.shadow.mapSize.width = 256;
light.shadow.mapSize.height = 256;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 3;
scene.add( light );

const light2 = new THREE.PointLight( 0xffffff, 1, 10 );
light2.position.set( -3, 2, -4 );
light2.castShadow = true;
light2.shadow.mapSize.width = 256;
light2.shadow.mapSize.height = 256;
light2.shadow.camera.near = 0.1;
light2.shadow.camera.far = 3;
scene.add( light2 );


UTILS.draw_axis(scene,9, 3);


const cubeTexture = new THREE.TextureLoader().load( '/textures/3.png' );
const planeTexture = new THREE.TextureLoader().load( '/textures/6.png' );
const particleTexture = new THREE.TextureLoader().load( '/textures/snow2.png' );

const geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
//const geometry = new THREE.SphereGeometry( 2, 6, 16 );
const material = new THREE.MeshStandardMaterial({ map: cubeTexture, transparent: false,  color: 0xFFFFFF });
const cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.z = -5;
scene.add( cube );

// create an AudioListener and add it to the camera
const listener = new THREE.AudioListener();
camera.add( listener );
// create the PositionalAudio object (passing in the listener)
const sound = new THREE.PositionalAudio( listener );
// load a sound and set it as the PositionalAudio object's buffer
const audioLoader = new THREE.AudioLoader();
audioLoader.load( '/audio/kapli-zvuk-kapel-iz-krana.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setRefDistance( 0.5 );
	sound.play();
});
cube.add( sound );

//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry( 20, 20, 5, 5 );
const planeMaterial = new THREE.MeshStandardMaterial({ map: planeTexture, transparent: false, color: 0xffffff } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
plane.rotation.x = -Math.PI/2;
plane.position.y = -3;
scene.add( plane );


let particles = new THREE.BufferGeometry;
const particles_count = 500;
let vertices = new Float32Array(particles_count * 3);
for (let p = 0; p < particles_count * 3; p++) {
	vertices[p] = Math.random() * 10 - 5;
}
particles.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );

var particleMaterial = new THREE.PointsMaterial({ map: particleTexture, transparent: true, size: 0.05 });
var particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

/*const lightHelper = new THREE.PointLightHelper( light, 1, 0xffff00 );
scene.add(lightHelper);*/

//Create a helper for the shadow camera (optional)
/*const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );*/

/*
const loader = new GLTFLoader();
loader.load( '/models/house.glb', function ( gltf ) {
	scene.add( gltf.scene );
}, undefined, function ( error ) {
	console.error( error );
} );
*/


renderer.xr.enabled = true;
document.body.appendChild( VRButton.createButton( renderer ) );

var light_move = 0.05;
var light2_move = -0.05;
camera.position.set(0, 1.5, 0);
//camera.lookAt(0,3,-3);
//camera.rotation.set(0, 2, 1);
//camera.lookAt(0,0,-3);
//camera.rotation.y = -1;
//console.log('rotation ' + JSON.stringify(camera.rotation));
//camera.rotation.set(-3.14/4, 0, 0);
//camera.rotation.set(0, -3.14/4, 0);
//console.log('rotation ' + JSON.stringify(camera.rotation));

let dolly = new THREE.Object3D();
dolly.position.set( 0, 0, 0 );
dolly.add(camera);
scene.add(dolly);

//console interface with text/buttons etc
/*const console_geometry = new THREE.BoxGeometry(3, 2, 0.1, 1, 1, 1);
const console_material = new THREE.MeshStandardMaterial({transparent: false,  color: 0x996666});
const console = new THREE.Mesh(console_geometry, console_material);
console.position.y = 1.5;
console.position.z = -1.5;
dolly.add(console);*/

dolly.rotation.set(-3.14/4, 0, 0);
dolly.rotation.set(0, -3.14/4, 0);

let dolly_pos = new THREE.Object3D();
camera.add(dolly_pos);


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

	if (light.position.x >= 3) {
		light_move = -light_move_speed * clockDelta;
	}
	if (light.position.x <= -3) {
		light_move = light_move_speed * clockDelta;
	}
	light.position.x += light_move;

	if (light2.position.x >= 3) {
		light2_move = -light_move_speed * clockDelta;
	}
	if (light2.position.x <= -3) {
		light2_move = light_move_speed * clockDelta;
	}
	light2.position.x += light2_move;
}


const dolly_move_speed = 6; // meters per second
const dolly_turn_speed = 1; // rotations per second
function gamepadUpdate(clockDelta) {
	/*let buttons = GAMEPAD.getButtons();
	let axes = GAMEPAD.getAxes();*/
	let gamepadState = GAMEPAD.getAllState();
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
		dolly.rotation.set(0, dolly.rotation.y + PI * clockDelta, 0);
	}
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_TURN_RIGHT]) {
		dolly.rotation.set(0, dolly.rotation.y - PI * clockDelta, 0);
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
	var worldQuaternion = dolly_pos.getWorldQuaternion(new THREE.Quaternion());
	dolly.quaternion.copy(worldQuaternion);

	//dolly.quaternion.copy(dolly_pos.getWorldQuaternion());
	dolly.translateZ(-(gamepadState.axes[GAMEPAD.GAMEPAD_UP] - gamepadState.axes[GAMEPAD.GAMEPAD_DOWN]) * dolly_move_speed * clockDelta);
	dolly.translateX(-(gamepadState.axes[GAMEPAD.GAMEPAD_LEFT] - gamepadState.axes[GAMEPAD.GAMEPAD_RIGHT]) * dolly_move_speed * clockDelta);
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


