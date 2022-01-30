"use strict";

import * as GAMEPAD from './gamepad.js'

var d = document.getElementById("data");

function updateStatus() {
	let buttons = GAMEPAD.getButtons();
	let axes = GAMEPAD.getAxes();
	d.innerHTML = buttons + '<br/> ' + axes;
	//console.log(buttons + ' - ' + axes);
}
setInterval(updateStatus, 20);
