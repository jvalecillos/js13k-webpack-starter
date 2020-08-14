import { start } from './asteroids'

let canvas = document.createElement('canvas');

canvas.width = 600;
canvas.height = 600;

let body = document.getElementsByTagName("body")[0];
body.appendChild(canvas);

start();
