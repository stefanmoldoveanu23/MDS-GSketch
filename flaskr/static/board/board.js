import {Line, Triangle} from './geometry.js';

let socket = io('/board');

// This array accumulates pending changes to the board.
let pending = [];

// On receiving changes, add them into the pending list.
socket.on('update', function (update) {
    pending.push(JSON.parse(update))
});

// Apply the update to the canvas.
function apply_update(canvas, update) {
    let handlers = {
        "create_line": new Line(canvas, socket, update.params),
        "create_triangle": new Triangle(canvas, socket, update.params)
    }
    let handler = handlers[update.name];
    handler.print();
}

// Bottom layer; holds full sketch.
let sketchBottom = function(canvas) {

    canvas.setup = function() {
        let cvsObject = canvas.createCanvas(canvas.windowWidth / 2, canvas.windowHeight / 2);
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        canvas.background(255);
    }

    canvas.draw = function() {
        // draws a line immediately after receiving it from top layer
        pending.forEach(function(update) {
            apply_update(canvas, update);
        });
        pending = [];
    }

}

// top layer; holds active addition
let sketchTop = function(canvas) {
    let tool;

    canvas.setup = function() {
        let cvsObject = canvas.createCanvas(canvas.windowWidth / 2, canvas.windowHeight / 2);
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        // The tool will eventually be assigned values by pressing the buttons; therefore it will most likely be made global.
        tool = new Triangle(canvas, socket);
    }

    canvas.draw = function () { tool.draw(); };

    canvas.mouseReleased = function() { tool.mouseReleased(); };

}

$(document).ready(function() {
    new p5(sketchBottom);
    new p5(sketchTop);
})