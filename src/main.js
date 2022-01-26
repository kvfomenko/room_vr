import * as THREE from 'three'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls.js'
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

//import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
//import * as THREE from '/js/three.js';
//import { VRButton } from '/js/VRButton.js';
//import { GLTFLoader } from '/js/GLTFLoader.js';
//import GLTFLoader from '/js/GLTFLoader.js';
//import { FirstPersonControls } from '/js/FirstPersonControls.js';
//import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );

//var controls = new THREE.VRControls(camera);
/*var dolly = new THREE.Group();
dolly.position.set( 5, 0, 5 );
scene.add(dolly);
dolly.add(camera);*/

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



draw_axis(9, 3);

const cubeTexture = new THREE.TextureLoader().load( '/textures/3.png' );
const planeTexture = new THREE.TextureLoader().load( '/textures/6.png' );
const particleTexture = new THREE.TextureLoader().load( '/textures/snow2.png' );

const geometry = new THREE.BoxGeometry( 1, 1, 1, 2, 2, 2 );
//const geometry = new THREE.SphereGeometry( 2, 6, 16 );
const material = new THREE.MeshStandardMaterial({ map: cubeTexture, transparent: false,  color: 0xFFFFFF });
const cube = new THREE.Mesh( geometry, material );
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.z = -5;
scene.add( cube );


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
} );*/



renderer.xr.enabled = true;
document.body.appendChild( VRButton.createButton( renderer ) );

var camera_move = 0.01;
var light_move = 0.05;
var light2_move = -0.05;
camera.position.x = 0;
camera.position.y = 2 ;
camera.position.z = 2;
camera.lookAt(0,0,-1);

const controls = new OrbitControls(camera, renderer.domElement);
const personControls = new FirstPersonControls(camera, renderer.domElement);
personControls.lookSpeed = 0.1;
personControls.movementSpeed = 10;
const clock = new THREE.Clock(true);

function animate() {
	//requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	particleSystem.rotation.y += 0.002;

	/*if (camera.position.y > 3) {
		camera_move = -0.01;
	}
	if (camera.position.y < -2) {
		camera_move = 0.01;
	}
	camera.position.y += camera_move;*/

	if (light.position.x >= 3) {
		light_move = -0.05;
	}
	if (light.position.x <= -3) {
		light_move = 0.05;
	}
	light.position.x += light_move;

	if (light2.position.x >= 3) {
		light2_move = -0.05;
	}
	if (light2.position.x <= -3) {
		light2_move = 0.05;
	}
	light2.position.x += light2_move;


	//controls.update();
	personControls.update(clock.getDelta());
	renderer.render(scene, camera);
};

animate();

renderer.setAnimationLoop( function () {
	animate();
} );


function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	//firstPerson.handleResize();

	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);


function draw_axis(distance, size) {

	const tex_x_minus = new THREE.TextureLoader().load('/textures/x_minus.png');
	const tex_x_plus = new THREE.TextureLoader().load('/textures/x_plus.png');
	const tex_y_minus = new THREE.TextureLoader().load('/textures/y_minus.png');
	const tex_y_plus = new THREE.TextureLoader().load('/textures/y_plus.png');
	const tex_z_minus = new THREE.TextureLoader().load('/textures/z_minus.png');
	const tex_z_plus = new THREE.TextureLoader().load('/textures/z_plus.png');

	var geometry_1 = new THREE.BoxGeometry(0, size, size, 1, 1, 1);
	var material_1 = new THREE.MeshBasicMaterial({map: tex_x_plus, transparent: true, color: 0xFFFFFF});
	var obj_1 = new THREE.Mesh(geometry_1, material_1);
	obj_1.position.x = distance;
	scene.add(obj_1);

	material_1 = new THREE.MeshBasicMaterial({map: tex_x_minus, transparent: true, color: 0xFFFFFF});
	obj_1 = new THREE.Mesh(geometry_1, material_1);
	obj_1.position.x = -distance;
	scene.add(obj_1);

	geometry_1 = new THREE.BoxGeometry(size, 0, size, 1, 1, 1);
	material_1 = new THREE.MeshBasicMaterial({map: tex_y_plus, transparent: true, color: 0xFFFFFF});
	obj_1 = new THREE.Mesh(geometry_1, material_1);
	obj_1.position.y = distance;
	scene.add(obj_1);

	material_1 = new THREE.MeshBasicMaterial({map: tex_y_minus, transparent: true, color: 0xFFFFFF});
	obj_1 = new THREE.Mesh(geometry_1, material_1);
	obj_1.position.y = -distance;
	scene.add(obj_1);

	geometry_1 = new THREE.BoxGeometry(size, size, 0, 1, 1, 1);
	material_1 = new THREE.MeshBasicMaterial({map: tex_z_plus, transparent: true, color: 0xFFFFFF});
	obj_1 = new THREE.Mesh(geometry_1, material_1);
	obj_1.position.z = distance;
	scene.add(obj_1);

	material_1 = new THREE.MeshBasicMaterial({map: tex_z_minus, transparent: true, color: 0xFFFFFF});
	obj_1 = new THREE.Mesh(geometry_1, material_1);
	obj_1.position.z = -distance;
	scene.add(obj_1);


}
