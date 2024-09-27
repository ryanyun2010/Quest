'use strict';
import * as PEngine from './PEngine.js';
import {Position} from "./RenderingHelpers.js"

let renderer = new PEngine.RenderingEngine();
let camera = new PEngine.Camera(new Position(-50,0),3840,2160, renderer);
camera.setup().then(() => {
  // setTimeout(function(){camera.render()},1000);
});

setInterval(function(){
  camera.position.x +=5;
  camera.position.y +=0.5;
  camera.render();
},1000/60);




