"use strict";

import * as THREE from "three";


function draw_axis(scene, distance, size) {

	const tex_x_minus = new THREE.TextureLoader().load('/textures/x_minus.png');
	const tex_x_plus = new THREE.TextureLoader().load('/textures/x_plus.png');
	const tex_y_minus = new THREE.TextureLoader().load('/textures/y_minus.png');
	const tex_y_plus = new THREE.TextureLoader().load('/textures/y_plus.png');
	const tex_z_minus = new THREE.TextureLoader().load('/textures/z_minus.png');
	const tex_z_plus = new THREE.TextureLoader().load('/textures/z_plus.png');

	let geometry_1 = new THREE.BoxGeometry(0, size, size, 1, 1, 1);
	let material_1 = new THREE.MeshBasicMaterial({map: tex_x_plus, transparent: true, color: 0xFFFFFF});
	let obj_1 = new THREE.Mesh(geometry_1, material_1);
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


export {draw_axis};
