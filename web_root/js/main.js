import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
//import * as THREE from '/js/three.js';
import { VRButton } from '/js/VRButton.js';
//import { GLTFLoader } from '/js/GLTFLoader.js';
//import GLTFLoader from '/js/GLTFLoader.js';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 100 );

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );



/*const light0 = new THREE.AmbientLight( 0x404040 ); // soft white light
scene.add( light0 );*/

const light = new THREE.PointLight( 0xffffff, 1, 10 );
light.position.set( 2, 2, 3 );
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.1; // default
light.shadow.camera.far = 2; // default


const geometry = new THREE.BoxGeometry( 1, 1, 1, 2, 2, 2 );
//const geometry = new THREE.SphereGeometry( 2, 6, 16 );
//const geometry = new THREE.SphereGeometry( 1, 16, 16 );
const material = new THREE.MeshStandardMaterial( { color: 0xff9900 } );
const cube = new THREE.Mesh( geometry, material );
cube.castShadow = true; //default is false
cube.receiveShadow = true; //default
cube.position.z = 1;
scene.add( cube );


//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry( 10, 7, 7, 5 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
scene.add( plane );

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

camera.position.y = -3;
camera.position.z = 5;
camera.lookAt(0,0,0);

function animate() {
	requestAnimationFrame( animate );

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	/*line.rotation.x += 0.02;
	line.rotation.y += 0.03;*/

	renderer.render( scene, camera );
};

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

animate();

renderer.setAnimationLoop( function () {
	renderer.render( scene, camera );
} );

