import {Line, Triangle} from './geometry.js';

let socket = io('/board');

// This array accumulates pending changes to the board.
let pending = [];

// On receiving changes, add them into the pending list.
socket.on('update', function (update) {
    socket.emit('save', board_data._id);
    pending.push(JSON.parse(update));
});

// If there was an error with the database, force exit every user to the home page.
socket.on('database-error', function() {
    alert("There was an error with the database.");
    $(document).location.href = "/";
});

// Apply the update to the canvas.
function apply_update(canvas, update) {
    let handlers = {
        "create_line": new Line(canvas, socket, update.params),
        "create_triangle": new Triangle(canvas, socket, update.params)
    };
    let handler = handlers[update.name];
    handler.print();
}

//Get canvas width an height
let board =  $("#board");
let wid = parseInt(board.width());
let hei = parseInt(board.height());

// Bottom layer; holds full sketch.
let sketchBottom = function (canvas) {

    canvas.setup = function () {
        canvas.pixelDensity(1);
        let cvsObject = canvas.createCanvas(board_data.width, board_data.height);
        cvsObject.parent('board');

        canvas.background(255);

        // Draw the image from the database.
        // canvas.loadPixels();
        // for (let i = 0; i < board_data.width; ++i) {
        //     for (let j = 0; j < board_data.height; ++j) {
        //         let index = 4 * (i * board_data.height + j);
        //         canvas.pixels[index] = board_data.baseImage[index].charCodeAt(0);
        //         canvas.pixels[index + 1] = board_data.baseImage[index + 1].charCodeAt(0);
        //         canvas.pixels[index + 2] = board_data.baseImage[index + 2].charCodeAt(0);
        //         canvas.pixels[index + 3] = board_data.baseImage[index + 3].charCodeAt(0);
        //     }
        // }
        // canvas.updatePixels();
    }

    canvas.draw = function () {
        // draws a line immediately after receiving it from top layer
        pending.forEach(function (update) {
            apply_update(canvas, update);
        });
        pending = [];
    }

}

// top layer; holds active addition
let sketchTop = function (canvas) {
    let tool;

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas(board_data.width, board_data.height);
        cvsObject.mouseReleased(function () {
            tool.mouseReleased();
        });
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        // The tool will eventually be assigned values by pressing the buttons; therefore it will most likely be made global.
        tool = new Triangle(canvas, socket);
    }

    canvas.draw = function () {
        tool.draw();
    };

}



$(document).ready(async function () {
    // TODO: socket emit join room

    if (board_data.width === 0) {
        // If the board hasn't been properly created yet, initialize it.

        await new Promise((resolve) => {
            socket.on('done_init', function(updated_board) {
                resolve(updated_board);
            });

            socket.emit('init', wid, hei);
        }).then(updated_board => {
            board_data = updated_board
        });

    }

    pending = board_data.actions.map((x) => JSON.parse(x));

    new p5(sketchBottom);
    new p5(sketchTop);
})