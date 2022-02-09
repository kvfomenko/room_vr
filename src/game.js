"use strict";

import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as UTILS from './utils.js'
import * as GAMEPAD from './gamepad.js'

const dolly_move_speed = 6; // meters per second
const dolly_turn_speed = 0.5; // rotations per second
const bullets_per_second = 8;
const bullets_limit = 100;
const initial_bullet_speed = 15;
const isAutoRenewBullets = true;
const gravity = {x:0, y:-9.8, z:0};

const PI = Math.PI;
const PI2 = Math.PI * 2;
var gamepadState;
var clock;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 50 );
const renderer = new THREE.WebGLRenderer({antialias:true});

function initRenderer() {
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
	renderer.shadowMap.autoUpdate = true;
	renderer.shadowMap.needsUpdate = true;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
}

var lights = [];
function initLights() {
	const fogColor = new THREE.Color(0x000000); //0x222230
	scene.background = fogColor;
	scene.fog = new THREE.Fog(fogColor, 0.1, 40);

	/*const light0 = new THREE.AmbientLight( 0x404040 );
	scene.add( light0 );*/

	/*let light = new THREE.PointLight(0xffffaa, 1, 10);
	light.position.set(3, 2, -4);
	light.castShadow = true;
	light.shadow.mapSize.width = 128;
	light.shadow.mapSize.height = 128;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 3;
	light.xx_speed = {x:1.0, y:0, z:0};

	lights.push(light);
	scene.add(light);

	light = new THREE.PointLight(0xffbbbb, 1, 10);
	light.position.set(-3, 2, -3);
	light.castShadow = true;
	light.shadow.mapSize.width = 128;
	light.shadow.mapSize.height = 128;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 3;
	light.xx_speed = {x:0, y:0, z:1.0};

	lights.push(light);
	scene.add(light);*/



	for (let k=0;k<3;k++){
		for (let n=0;n<3;n++){
			let light = new THREE.PointLight(0xffffaa, 1, 10);
			light.position.set(k*10-15, 2.1, n*10-15);
			light.castShadow = false;
			light.shadow.mapSize.width = 128;
			light.shadow.mapSize.height = 128;
			light.shadow.camera.near = 0.1;
			light.shadow.camera.far = 3;
			//lights.push(light);
			scene.add(light);
		}
	}




	/*const lightHelper = new THREE.PointLightHelper( light, 1, 0xffff00 );
	scene.add(lightHelper);*/

}


var dolly, dummyCam;
function initCamera() {
	renderer.xr.enabled = true;
	//document.body.appendChild(VRButton.createButton(renderer));

	camera.position.set(0, 1.5, 0);
	//look a bit down
	//camera.rotation.set(-PI / 8, 0, 0);

	dolly = new THREE.Object3D();
	dolly.position.set(0, 0, 0);
	dolly.add(camera);
	scene.add(dolly);

	dummyCam = new THREE.Object3D();
	camera.add(dummyCam);

	//dolly base
	/*var geometryBase = new THREE.BoxGeometry(1, 0.2, 1, 1, 1, 1);
	var materialBase = new THREE.MeshStandardMaterial({transparent: false, color: 0xFFFFFF});
	const cubeBase = new THREE.Mesh(geometryBase, materialBase);
	dolly.add(cubeBase);*/
}


var cube, portal_gun, particleSystem, floor, ceiling;
function initGeometry() {

	/*const cubeTexture = new THREE.TextureLoader().load('/textures/portal_cube.jpg');
	var geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
//const geometry = new THREE.SphereGeometry( 2, 6, 16 );
	var material = new THREE.MeshStandardMaterial({map: cubeTexture, transparent: false, color: 0xFFFFFF});
	const cube1 = new THREE.Mesh(geometry, material);
	cube1.castShadow = true;
	cube1.receiveShadow = true;
	cube1.position.y = 1;
	//cube1.position.z = -5;
	scene.add(cube1);*/


	//FLOOR that receives shadows
	let floorGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
	let floorTexture = new THREE.TextureLoader().load('/textures/floor2.jpg');
	floorTexture.repeat.x = 50;
	floorTexture.repeat.y = 50;
	floorTexture.wrapS = THREE.RepeatWrapping; //THREE.MirroredRepeatWrapping / THREE.RepeatWrapping
	floorTexture.wrapT = THREE.RepeatWrapping; //THREE.MirroredRepeatWrapping / THREE.RepeatWrapping
	let floorMaterial = new THREE.MeshStandardMaterial({map: floorTexture, transparent: false, color: 0xffffff})
	floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.receiveShadow = true;
	floor.rotation.x = -PI/2;
	floor.position.y = 0;
	scene.add(floor);

	//CEILING that receives shadows
	let ceilingGeometry = new THREE.PlaneGeometry(100, 100, 50, 50);
	let ceilingTexture = new THREE.TextureLoader().load('/textures/ceiling1.jpg');
	ceilingTexture.repeat.x = 20;
	ceilingTexture.repeat.y = 20;
	ceilingTexture.wrapS = THREE.RepeatWrapping; //THREE.MirroredRepeatWrapping / THREE.RepeatWrapping
	ceilingTexture.wrapT = THREE.RepeatWrapping; //THREE.MirroredRepeatWrapping / THREE.RepeatWrapping
	let ceilingMaterial = new THREE.MeshStandardMaterial({map: ceilingTexture, transparent: false, color: 0xffffff})
	ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
	ceiling.receiveShadow = true;
	ceiling.rotation.x = PI/2;
	ceiling.position.y = 2.2;
	scene.add(ceiling);


	const particles_count = 50;
	const particleTexture = new THREE.TextureLoader().load('/textures/snow2.png');
	let particles = new THREE.BufferGeometry;
	let vertices = new Float32Array(particles_count * 3);
	for (let p = 0; p < particles_count * 3; p++) {
		vertices[p] = Math.random() * 10 - 5;
	}
	particles.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

	let particleMaterial = new THREE.PointsMaterial({map: particleTexture, transparent: true, size: 0.05});
	particleSystem = new THREE.Points(particles, particleMaterial);
	scene.add(particleSystem);


	//console interface with text/buttons etc
	/*const console_geometry = new THREE.BoxGeometry(3, 2, 0.1, 1, 1, 1);
	const console_material = new THREE.MeshStandardMaterial({transparent: false,  color: 0x996666});
	const console = new THREE.Mesh(console_geometry, console_material);
	console.position.y = 1.5;
	console.position.z = -1.5;
	dolly.add(console);*/

}
var portal_gun_bullet_emitter, portal_gun_bullet_emitter2;

/*const portal_gun_bullet_emitter_m = new THREE.MeshStandardMaterial({transparent: false,  color: 0x00ff00});
let portal_gun_bullet_emitter_g = new THREE.BoxGeometry(0.03, 0.03, 0.1, 1, 1, 1);
portal_gun_bullet_emitter = new THREE.Mesh(portal_gun_bullet_emitter_g, portal_gun_bullet_emitter_m);*/
portal_gun_bullet_emitter = new THREE.Object3D();
portal_gun_bullet_emitter.position.set(0.3, -0.3, -0.7);

//portal_gun_bullet_emitter2 = new THREE.Mesh(portal_gun_bullet_emitter_g, portal_gun_bullet_emitter_m);
portal_gun_bullet_emitter2 = new THREE.Object3D();
portal_gun_bullet_emitter2.position.set(0.3, -0.3, -1.2); // 1 meter vector

function loadObjects() {

	const loader = new GLTFLoader();

	//load portal gun
	loader.load('/models/portal_gun/scene.gltf',
		function (gltf) {
			portal_gun = gltf.scene;
			portal_gun.scale.set(0.1, 0.1, 0.1);
			portal_gun.rotation.set(0, PI, 0);
			portal_gun.position.set(0.3, -0.3, 0.0);
			camera.add(portal_gun);

			camera.add(portal_gun_bullet_emitter);
			camera.add(portal_gun_bullet_emitter2);

			//portal_gun.add(new THREE.AxesHelper(2));
			//scene.add(gltf.scene);
		},
		undefined,
		function (error) {
			console.error(error)
		}
	)

	//load companion cube
	loader.load('/models/portal_companion_cube/scene.gltf',
		function (gltf) {
			cube = gltf.scene.children[0].children[0].children[0];
			cube.scale.set(0.3, 0.3, 0.3);
			cube.position.y = -0.1;
			cube.position.z = -4;
			cube.xx_speed = {x:0, y:-1.5, z:0};
			cube.xx_rotation = {x:0, y:1/4, z:0}; // rotations per second
			//cube.add(new THREE.AxesHelper(2));

			cube.traverse(function(node) {
				//console.log('node-------------------' + node.type + ':' + node.name);
				if (node.isMesh) {
					node.castShadow = true;
				}
			});

			cube.add(sound);
			scene.add(cube);
		},
		undefined,
		function (error) {
			console.error(error)
		}
	)
}


var sound;
function initAudio() {
	// create an AudioListener and add it to the camera
	const listener = new THREE.AudioListener();
	camera.add(listener);
// create the PositionalAudio object (passing in the listener)
	sound = new THREE.PositionalAudio(listener);
// load a sound and set it as the PositionalAudio object's buffer
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load('/audio/zvuki-lesa-noch.mp3', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setRefDistance(1);
		sound.setDistanceModel('exponential');
		sound.setRolloffFactor(3);
		sound.setVolume(0.2);
		//sound.play();
	});
}


//const controls = new OrbitControls(camera, renderer.domElement);
/*const personControls = new FirstPersonControls(camera, renderer.domElement);
personControls.lookSpeed = 0.1;
personControls.movementSpeed = 10;*/


const cubeMaxSpeed = 1.5;
const cubeMinPos = -0.8;
const cubeMaxPos = -0.1;
function sceneUpdate(clockDelta) {
	if (clockDelta > 0.05) {clockDelta = 0.05};

	if (cube) {
		cube.rotation.y += cube.xx_rotation.y * PI2 * clockDelta;

		if (cube.position.y >= cubeMaxPos) {
			cube.position.y = cubeMaxPos;
			cube.xx_speed.y = -cubeMaxSpeed/10;
		}
		if (cube.position.y <= cubeMinPos) {
			cube.position.y = cubeMinPos;
			cube.xx_speed.y = cubeMaxSpeed;
		}
		cube.xx_speed.y = Math.sign(cube.xx_speed.y) * (1.01 - Math.pow((cube.position.y - cubeMinPos) / (cubeMaxPos - cubeMinPos) /2,2)) * cubeMaxSpeed;
		if (Math.abs(cube.xx_speed.y) < cubeMaxSpeed/20) {
			cube.xx_speed.y = Math.sign(cube.xx_speed.y) * cubeMaxSpeed/20;
		}
		cube.position.y += cube.xx_speed.y * clockDelta;
	}

	particleSystem.rotation.y += 1/50 * PI2 * clockDelta;

	/*for (let i=0; i<lights.length; i++) {
		if (lights[i].position.x > 4) {
			lights[i].position.x = 4;
			lights[i].xx_speed.x = -lights[i].xx_speed.x;
		}
		if (lights[i].position.x < -4) {
			lights[i].position.x = -4;
			lights[i].xx_speed.x = -lights[i].xx_speed.x;
		}
		if (lights[i].position.z > 1) {
			lights[i].position.z = 1;
			lights[i].xx_speed.z = -lights[i].xx_speed.z;
		}
		if (lights[i].position.z < -7) {
			lights[i].position.z = -7;
			lights[i].xx_speed.z = -lights[i].xx_speed.z;
		}
		lights[i].position.x += lights[i].xx_speed.x * clockDelta;
		lights[i].position.z += lights[i].xx_speed.z * clockDelta;
	}*/
	//console.log('lights['+0+'].xx_speed ', lights[0].xx_speed, lights[0].position);
}


var bullets = [];
let bulletGeometry = new THREE.SphereGeometry( 0.05, 32, 16 );
let prevBulletTime = 0;
let isShooting = false;

/*let testMaterial = new THREE.MeshStandardMaterial({transparent: false, color: 0x00ff00});
var testBullet = new THREE.Mesh(bulletGeometry, testMaterial);
scene.add(testBullet);*/

function shootingControl(clockDelta) {

	if (!gamepadState.buttons[GAMEPAD.GAMEPAD_A] && isShooting) {
		isShooting = false;
	}

	if (gamepadState.buttons[GAMEPAD.GAMEPAD_A] && !isShooting) {
		let newBulletTime = clock.getElapsedTime();

		if (newBulletTime - prevBulletTime >= 1 / bullets_per_second
			&& bullets.length - 1 < bullets_limit) {
			//NEW BULLET SHOOTING
			isShooting = true;

			let bulletWorldPosition = new THREE.Vector3();
			let bulletWorldPosition2 = new THREE.Vector3();
			let bulletWorldDirection = new THREE.Vector3();

			/*portal_gun_bullet_emitter.getWorldPosition(bulletWorldPosition);
			portal_gun_bullet_emitter2.getWorldPosition(bulletWorldPosition2);*/
			portal_gun_bullet_emitter.getWorldPosition(bulletWorldPosition);
			portal_gun_bullet_emitter2.getWorldPosition(bulletWorldPosition2);
			//console.log('portal_gun---', portal_gun_bullet_emitter.worldPosition, portal_gun_bullet_emitter.worldQuaternion);

			bulletWorldDirection.x = bulletWorldPosition2.x - bulletWorldPosition.x;
			bulletWorldDirection.y = bulletWorldPosition2.y - bulletWorldPosition.y;
			bulletWorldDirection.z = bulletWorldPosition2.z - bulletWorldPosition.z;

			let randomColor = Math.floor(Math.random() * 16777215);
			let bulletMaterial = new THREE.MeshStandardMaterial({transparent: false, color: randomColor});

			//!!!!!!!!!!!!!!!!!!!!!bug fix for VR only!!!!!!!!!!!!!!!!!!!!!
			bulletWorldPosition.x -= dolly.position.x;
			bulletWorldPosition.y -= dolly.position.y;
			bulletWorldPosition.z -= dolly.position.z;
			//!!!!!!!!!!!!!!!!!!!!!bug fix for VR only!!!!!!!!!!!!!!!!!!!!!

			bullets.push({
				mesh: new THREE.Mesh(bulletGeometry, bulletMaterial),
				xx_emitTime: newBulletTime,
				xx_lineSpeed: initial_bullet_speed,
				xx_startPosition: bulletWorldPosition,
				xx_startDirection: bulletWorldDirection
			});

			bullets[bullets.length - 1].mesh.castShadow = true;
			bullets[bullets.length - 1].mesh.receiveShadow = false;
			bullets[bullets.length - 1].mesh.position.x = bulletWorldPosition.x;
			bullets[bullets.length - 1].mesh.position.y = bulletWorldPosition.y;
			bullets[bullets.length - 1].mesh.position.z = bulletWorldPosition.z;
			scene.add(bullets[bullets.length - 1].mesh);

			prevBulletTime = newBulletTime;


			if (isAutoRenewBullets && bullets.length >= bullets_limit-1) {
				scene.remove(bullets[0].mesh);
				bullets[0].mesh = null;
				bullets.shift();
			}
		}
	}

	//move existing bullets
	for (let i = 0; i < bullets.length; i++) {
		bullets[i].xx_lineSpeed -= 2 * clockDelta;
		if (bullets[i].xx_lineSpeed < 0) {
			bullets[i].xx_lineSpeed = 0;
		}
		if (bullets[i].xx_lineSpeed > 0) {
			bullets[i].mesh.position.x += bullets[i].xx_startDirection.x * bullets[i].xx_lineSpeed * clockDelta;
			bullets[i].mesh.position.y += bullets[i].xx_startDirection.y * bullets[i].xx_lineSpeed * clockDelta;
			bullets[i].mesh.position.z += bullets[i].xx_startDirection.z * bullets[i].xx_lineSpeed * clockDelta;
		}
	}
}


function gamepadUpdate(clockDelta) {
	gamepadState = GAMEPAD.getAllState();
	//console.log('buttons: ' + buttons + ' axes: ' + axes);

	//dolly_pos = dolly.position.clone();
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_TURN_LEFT]) {
		dolly.rotateY(PI2 * dolly_turn_speed * clockDelta);
	}
	if (gamepadState.buttons[GAMEPAD.GAMEPAD_TURN_RIGHT]) {
		dolly.rotateY(-PI2 * dolly_turn_speed * clockDelta);
	}

	//dolly.position.copy(dolly_pos);

	//Store original dolly rotation
	const quaternion = dolly.quaternion.clone();
	//Get rotation for movement from the headset pose
	let worldQuaternion = dummyCam.getWorldQuaternion(new THREE.Quaternion());
	dolly.quaternion.copy(worldQuaternion);

	let moveForward = (gamepadState.axes[GAMEPAD.GAMEPAD_UP] - gamepadState.axes[GAMEPAD.GAMEPAD_DOWN]);
	let moveLeftRight = (gamepadState.axes[GAMEPAD.GAMEPAD_LEFT] - gamepadState.axes[GAMEPAD.GAMEPAD_RIGHT]);
	dolly.translateZ(-moveForward/100 * dolly_move_speed * clockDelta);
	dolly.translateX(-moveLeftRight/100 * dolly_move_speed * clockDelta);
	/*dolly.position.x -= moveForward/100 * dolly_move_speed * clockDelta;
	dolly.position.z -= moveLeftRight/100 * dolly_move_speed * clockDelta;*/

	dolly.position.y = 0;
	dolly.quaternion.copy(quaternion);
	//camera.updateProjectionMatrix();


	/*let bulletWorldPosition3 = new THREE.Vector3();
	portal_gun_bullet_emitter2.getWorldPosition(bulletWorldPosition3);
	testBullet.position.x = bulletWorldPosition3.x - dolly.position.x;
	testBullet.position.y = bulletWorldPosition3.y - dolly.position.y;
	testBullet.position.z = bulletWorldPosition3.z - dolly.position.z;*/



	shootingControl(clockDelta);

}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//personControls.handleResize();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	let clockDelta = clock.getDelta(); // seconds from prev frame
	sceneUpdate(clockDelta);
	gamepadUpdate(clockDelta);

	//controls.update();
	//personControls.update(clockDelta);
	renderer.render(scene, camera);
}


//var buttonStart;
function init() {
	initRenderer();
	initLights();
	initCamera();
	initGeometry();
	initAudio();
	loadObjects(); //after camera and sound

	window.addEventListener('resize', onWindowResize, false);
	UTILS.createButton(start);
}

function start() {
	UTILS.disableStartButton();
	document.body.appendChild(VRButton.createButton(renderer));

	scene.add(new THREE.AxesHelper(5));

	clock = new THREE.Clock(true);
	if (sound) {sound.play()}
	animate();
	renderer.setAnimationLoop(animate);
}

export {init, start};

