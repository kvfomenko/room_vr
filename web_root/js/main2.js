import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 0.1, 100 );
//Create a WebGLRenderer and turn on shadows in the renderer
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//Create a PointLight and turn on shadows for the light
const light = new THREE.PointLight( 0xffffff, 1, 100 );
light.position.set( 4, 5, 5 );
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.1; // default
light.shadow.camera.far = 2; // default

const geometry = new THREE.BoxGeometry( 3, 3, 3, 2, 2, 2 );
//Create a sphere that cast shadows (but does not receive them)
//const geometry = new THREE.SphereGeometry( 5, 6, 16 );
const material = new THREE.MeshStandardMaterial( { color: 0xff9900 } );
const sphere = new THREE.Mesh( geometry, material );
sphere.castShadow = true; //default is false
sphere.receiveShadow = true; //default
scene.add( sphere );
sphere.position.z = 1;

//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry( 30, 20, 7, 5 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
scene.add( plane );

//Create a helper for the shadow camera (optional)
/*const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );*/



camera.position.y = -3;
camera.position.z = 15;
camera.lookAt(0,0,0);

function animate() {
	requestAnimationFrame( animate );

	sphere.rotation.x += 0.01;
	sphere.rotation.y += 0.01;

	//camera.rotateZ(0.01);
	//camera.position.z = camera.position.z + 0.01;
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
