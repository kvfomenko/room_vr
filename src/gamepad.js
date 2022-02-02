"use strict";

//const isSimulation = true;
let simulationData = {buttons: [false,false,false,false,false,false], axes: [0,0,0,0]}; //default simulationData
const buttons_ABCD_map = [1,3,2,0]; // <A>,<B>,<C>,<D>
const axes_UpDown_map = [0,-1,1]; // <axes_id>,<UP-direction>,<DOWN-direction>
const axes_LeftRight_map = [1,1,-1]; // <axes_id>,<LEFT-direction>,<RIGHT-direction>
const max_button_id = 3;
const min_axes_sensitivity = 0.1;

const GAMEPAD_A = 0; // W
const GAMEPAD_B = 1; // S
const GAMEPAD_C = 2; // A
const GAMEPAD_D = 3; // D
const GAMEPAD_TURN_LEFT = 4; // Q
const GAMEPAD_TURN_RIGHT = 5; // E
const GAMEPAD_UP = 0;
const GAMEPAD_DOWN = 1;
const GAMEPAD_LEFT = 2;
const GAMEPAD_RIGHT = 3;

let haveEvents = 'GamepadEvent' in window;
let haveWebkitEvents = 'WebKitGamepadEvent' in window;
let game_controllers = {};

if (haveEvents) {
	window.addEventListener("gamepadconnected", connectHandler);
	window.addEventListener("gamepaddisconnected", disconnectHandler);
} else if (haveWebkitEvents) {
	window.addEventListener("webkitgamepadconnected", connectHandler);
	window.addEventListener("webkitgamepaddisconnected", disconnectHandler);
} else {
	setInterval(scanGamepads, 500);
}

function scanGamepads() {
	let gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
	for (let i = 0; i < gamepads.length; i++) {
		if (gamepads[i] && (gamepads[i].index in game_controllers)) {
			game_controllers[gamepads[i].index] = gamepads[i];
		}
	}
/*	if (isSimulation && game_controllers.length === 0) {
		game_controllers[0] = simulationData;
	}*/
}

function connectHandler(e) {
	game_controllers[e.gamepad.index] = e.gamepad;
}

function disconnectHandler(e) {
	delete game_controllers[e.gamepad.index];
}


function decodeButtons() {
	let button_vals = [false,false,false,false,false,false];
	for (let j in game_controllers) {
		var controller = game_controllers[j];
		for (let i = 0; i < controller.buttons.length && i <= max_button_id; i++) {
			let val = controller.buttons[i];
			let pressed = val == 1.0;
			let touched = false;
			if (typeof (val) == "object") {
				pressed = val.pressed;
				if ('touched' in val) {
					touched = val.touched;
				}
				val = val.value;
			}
			if (pressed || touched) {
				button_vals[buttons_ABCD_map[i]] = true;
			}
		}
	}

	if (simulationData.buttons[GAMEPAD_A]) {
		button_vals[GAMEPAD_A] = true;
	}
	if (simulationData.buttons[GAMEPAD_B]) {
		button_vals[GAMEPAD_B] = true;
	}
	if (simulationData.buttons[GAMEPAD_C]) {
		button_vals[GAMEPAD_C] = true;
	}
	if (simulationData.buttons[GAMEPAD_D]) {
		button_vals[GAMEPAD_D] = true;
	}
	button_vals[GAMEPAD_TURN_LEFT] = simulationData.buttons[GAMEPAD_TURN_LEFT];
	button_vals[GAMEPAD_TURN_RIGHT] = simulationData.buttons[GAMEPAD_TURN_RIGHT];

	return button_vals;
}

function decodeAxis() {
	let axes_vals = [0,0,0,0];
	for (let j in game_controllers) {
		var controller = game_controllers[j];
		for (let i=0; i<controller.axes.length; i++) {
			if (Math.abs(controller.axes[i]) >= min_axes_sensitivity) {
				if (i === axes_UpDown_map[0]) {
					if (Math.sign(controller.axes[i]) === axes_UpDown_map[1]) {
						axes_vals[0] = Math.round(Math.abs(controller.axes[i]) * 100); //UP
					} else if (Math.sign(controller.axes[i]) === axes_UpDown_map[2]) {
						axes_vals[1] = Math.round(Math.abs(controller.axes[i]) * 100); //DOWN
					}
				}
				if (i === axes_LeftRight_map[0]) {
					if (Math.sign(controller.axes[i]) === axes_LeftRight_map[1]) {
						axes_vals[2] = Math.round(Math.abs(controller.axes[i]) * 100); //LEFT
					} else if (Math.sign(controller.axes[i]) === axes_LeftRight_map[2]) {
						axes_vals[3] = Math.round(Math.abs(controller.axes[i]) * 100); //RIGHT
					}
				}
			}
		}
	}

	if (simulationData.axes[GAMEPAD_UP] > 99) {
		axes_vals[GAMEPAD_UP] = 100;
	}
	if (simulationData.axes[GAMEPAD_DOWN] > 99) {
		axes_vals[GAMEPAD_DOWN] = 100;
	}
	if (simulationData.axes[GAMEPAD_LEFT] > 99) {
		axes_vals[GAMEPAD_LEFT] = 100;
	}
	if (simulationData.axes[GAMEPAD_RIGHT] > 99) {
		axes_vals[GAMEPAD_RIGHT] = 100;
	}

	return axes_vals;
}


// [<A>,<B>,<C>,<D>]
function getButtons() {
	scanGamepads();
	return decodeButtons();
}

// [<UP>,<DOWN>,<LEFT>,<RIGHT>]
function getAxes() {
	scanGamepads();
	return decodeAxis();
}

function getAllState() {
	scanGamepads();
	return {buttons:getButtons(), axes:decodeAxis()};
}

function keyDown(e) {
	console.log('keyDown ' + e.key);
	switch(e.key){
		case "w":
		case "W":
		case "ц":
		case "Ц":
			simulationData.buttons[GAMEPAD_A] = true;
			break;
		case "s":
		case "S":
		case "ы":
		case "Ы":
			simulationData.buttons[GAMEPAD_B] = true;
			break;
		case "a":
		case "A":
		case "ф":
		case "Ф":
			simulationData.buttons[GAMEPAD_C] = true;
			break;
		case "d":
		case "D":
		case "в":
		case "В":
			simulationData.buttons[GAMEPAD_D] = true;
			break;
		case "q":
		case "Q":
		case "й":
		case "Й":
			simulationData.buttons[GAMEPAD_TURN_LEFT] = true;
			break;
		case "e":
		case "E":
		case "у":
		case "У":
			simulationData.buttons[GAMEPAD_TURN_RIGHT] = true;
			break;

		case "ArrowUp":
			simulationData.axes[GAMEPAD_UP] = 100;
			break;
		case "ArrowDown":
			simulationData.axes[GAMEPAD_DOWN] = 100;
			break;
		case "ArrowLeft":
			simulationData.axes[GAMEPAD_LEFT] = 100;
			break;
		case "ArrowRight":
			simulationData.axes[GAMEPAD_RIGHT] = 100;
			break;
	}
}
function keyUp(e) {
	console.log('keyUp ' + e.key);
	switch(e.key){
		case "w":
		case "W":
		case "ц":
		case "Ц":
			simulationData.buttons[GAMEPAD_A] = false;
			break;
		case "s":
		case "S":
		case "ы":
		case "Ы":
			simulationData.buttons[GAMEPAD_B] = false;
			break;
		case "a":
		case "A":
		case "ф":
		case "Ф":
			simulationData.buttons[GAMEPAD_C] = false;
			break;
		case "d":
		case "D":
		case "в":
		case "В":
			simulationData.buttons[GAMEPAD_D] = false;
			break;
		case "q":
		case "Q":
		case "й":
		case "Й":
			simulationData.buttons[GAMEPAD_TURN_LEFT] = false;
			break;
		case "e":
		case "E":
		case "у":
		case "У":
			simulationData.buttons[GAMEPAD_TURN_RIGHT] = false;
			break;

		case "ArrowUp":
			simulationData.axes[GAMEPAD_UP] = 0;
			break;
		case "ArrowDown":
			simulationData.axes[GAMEPAD_DOWN] = 0;
			break;
		case "ArrowLeft":
			simulationData.axes[GAMEPAD_LEFT] = 0;
			break;
		case "ArrowRight":
			simulationData.axes[GAMEPAD_RIGHT] = 0;
			break;
	}
}
addEventListener("keydown", keyDown);
addEventListener("keyup", keyUp);


/*function pointerdown(e) {
	console.log('pointerdown ' + JSON.stringify(e));
	simulationData.buttons[GAMEPAD_A] = true;
	simulationData.axes[GAMEPAD_UP] = 100;
}
function pointerup(e) {
	console.log('pointerup ' + JSON.stringify(e));
	simulationData.buttons[GAMEPAD_A] = false;
	simulationData.axes[GAMEPAD_UP] = 0;
}

	addEventListener("pointerdown", pointerdown);
	addEventListener("pointerup", pointerup);*/

export {getButtons, getAxes, getAllState};
export {GAMEPAD_A,GAMEPAD_B,GAMEPAD_C,GAMEPAD_D,GAMEPAD_TURN_LEFT,GAMEPAD_TURN_RIGHT};
export {GAMEPAD_UP,GAMEPAD_DOWN,GAMEPAD_LEFT,GAMEPAD_RIGHT};

