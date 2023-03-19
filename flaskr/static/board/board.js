import {Tool} from "./tool.js";
import {Line, Triangle} from "./geometry.js";

Tool.get_object = function (canvas, json)  {
    let handlers = {
        "create_line": new Line(canvas, json.params),
        "create_triangle": new Triangle(canvas, json.params)
    };
    return handlers[json.name];
}

let socket = io('/board');

// Holds all changes done to the board.
let changes = [];

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

// Get canvas width an height.
let board =  $("#board");
let wid = parseInt(board.width());
let hei = parseInt(board.height());

// Bottom layer; holds full sketch.
let sketchBottom = function (canvas) {

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas(board_data.width, board_data.height);
        cvsObject.parent('board');

        canvas.background(255);
    }

    canvas.draw = function () {
        // draws a line immediately after receiving it from top layer
        pending.forEach(function (update) {
            let handler = Tool.get_object(canvas, update);
            handler.handleResize(1920 / canvas.width, 1080 / canvas.height);
            changes.push(handler);
            handler.print();
        });
        pending = [];
    }

    canvas.windowResized = function() {
        let newWid = parseInt(board.width());
        let newHei = parseInt(board.height());

        let k = Math.max( canvas.width / newWid, canvas.height / newHei);

        canvas.resizeCanvas(canvas.width / k, canvas.height / k);
        canvas.background(255);

        changes.forEach(change => {
            change.handleResize(k);
            change.print();
        });

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
        tool = new Triangle(canvas);
    }

    canvas.draw = function () {
        tool.draw();
    };

    canvas.windowResized = function() {
        let newWid = parseInt(board.width());
        let newHei = parseInt(board.height());

        let k = Math.max( canvas.width / newWid, canvas.height / newHei);

        canvas.resizeCanvas(canvas.width / k, canvas.height / k);

        tool.handleResize(k);
    }

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

    pending = board_data.actions.map(x => JSON.parse(x));

    Tool.socket = socket;

    new p5(sketchBottom);
    new p5(sketchTop);
});