'use strict';
import * as PEngine from './rendering/RenderingEngine.js';
import { Position } from './rendering/RenderingHelpers.js';

const renderer = new PEngine.RenderingEngine();
const camera = new PEngine.Camera(new Position(-50, 0), 3840, 2160, renderer);

camera.setup().then(() => {
	requestAnimationFrame(draw);
});

function draw() {
	console.timeEnd('frameTime');
	camera.position.x += 0.05;
	camera.position.y += 0.005;
	camera.render();
	console.time('frameTime');
	requestAnimationFrame(draw);
}
