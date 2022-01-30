"use strict";

const isSimulation = true;
let simulationData = {buttons: [1,0,1,0], axes: [-0.5, 0.5]}; //default simulationData
const buttons_map = [1,3,2,0];
const axes_UpDown_map = [0,-1,1]; // <axes_id>,<UP-direction>,<DOWN-direction>
const axes_LeftRight_map = [1,1,-1]; // <axes_id>,<LEFT-direction>,<RIGHT-direction>
const max_button_id = 3;
const GAMEPAD_A = 0;
const GAMEPAD_B = 1;
const GAMEPAD_C = 2;
const GAMEPAD_D = 3;
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
	if (isSimulation && gamepads.length === 0) {
		game_controllers[0] = simulationData;
	}
}

function connectHandler(e) {
	game_controllers[e.gamepad.index] = e.gamepad;
}

function disconnectHandler(e) {
	delete game_controllers[e.gamepad.index];
}

// [<A>,<B>,<C>,<D>]
function getButtons() {
	scanGamepads();
	let button_vals = [false,false,false,false];
	for (let j in game_controllers) {
		let controller = game_controllers[j];
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
				button_vals[buttons_map[i]] = true;
			}
		}
	}
	return button_vals;
}

// [<UP>,<DOWN>,<LEFT>,<RIGHT>]
function getAxes() {
	scanGamepads();
	let axes_vals = [0,0,0,0];
	for (let j in game_controllers) {
		let controller = game_controllers[j];
		for (let i=0; i<controller.axes.length; i++) {
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
	return axes_vals;
}


export {getButtons};
export {getAxes};
export {GAMEPAD_A,GAMEPAD_B,GAMEPAD_C,GAMEPAD_D};
export {GAMEPAD_UP,GAMEPAD_DOWN,GAMEPAD_LEFT,GAMEPAD_RIGHT};

