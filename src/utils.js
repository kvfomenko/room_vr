"use strict";

var buttonStart;
function disableStartButton() {
	buttonStart.onmouseenter = null;
	buttonStart.onmouseleave = null;
	buttonStart.onclick = null;
	buttonStart.style.display = 'none';
}
function stylizeButton(element) {
	element.style.position = 'absolute';
	element.style.cursor = 'auto';
	element.style.top = '50%';
	element.style.left = 'calc(50% - 75px)';
	element.style.width = '150px';
	element.style.padding = '12px 6px';
	element.style.border = '1px solid #fff';
	element.style.borderRadius = '4px';
	element.style.background = 'rgba(0,0,0,0.1)';
	element.style.color = '#fff';
	element.style.font = 'normal 13px sans-serif';
	element.style.textAlign = 'center';
	element.style.opacity = '0.5';
	element.style.outline = 'none';
	element.style.zIndex = '999';
}

function createButton(callback) {
	buttonStart = document.createElement( 'button' );
	buttonStart.textContent = 'Start game!';
	stylizeButton(buttonStart);
	document.body.appendChild(buttonStart);
	buttonStart.onclick = callback;
}

export {createButton, disableStartButton};
