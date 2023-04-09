import {Tool} from "./tool.js";
import {Line, Polygon, Rectangle, Triangle} from "./geometry.js";

Tool.get_object = function (canvas, json)  {
    let handlers = {
        "create_line": new Line(canvas, json.params),
        "create_triangle": new Triangle(canvas, json.params),
        "create_rectangle": new Rectangle(canvas, json.params),
        "create_polygon": new Polygon(canvas, json.params)
    };
    return handlers[json.name];
}

let socket = io('/board');

// This array accumulates all changes done to the board.
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

// Prints an update on the board.
function apply_update(canvas, update) {
    let tool = Tool.get_object(canvas, update);
    tool.handleResize(Tool.global_width / canvas.width, Tool.global_height / canvas.height);
    changes.push(tool);
    tool.print();
}

// Get canvas width an height.
let board = $("#board");
let wid = board.width();
let hei = board.height();

let zoomValues = [1/4, 1/3, 1/2, 2/3, 3/4, 4/5, 9/10, 1, 11/10, 5/4, 3/2, 7/4, 2, 5/2, 3, 4, 5];
let zoomIndex = 7;

// The bottom layer will hold the full sketch.
let sketchBottom = function (canvas) {

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas(wid, hei);
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        cvsObject.id('bottomLayer');

        canvas.background(255);
    }

    canvas.draw = function () {
        pending.forEach(function (update) {
            apply_update(canvas, update);
        });
        pending = [];
    }

    canvas.mouseWheel = function(event) {
        zoomIndex -= Math.floor(event.delta > 0 ? 1 : -1);

        zoomIndex = Math.max(zoomIndex, 0);
        zoomIndex = Math.min(zoomIndex, zoomValues.length - 1);

        canvas.windowResized();
        return false;
    }

    canvas.mouseDragged = function() {
        if (canvas.mouseButton === canvas.CENTER) {
            let cvsObject = canvas.select('#bottomLayer');

            cvsObject.position(cvsObject.position().x + canvas.movedX, cvsObject.position().y + canvas.movedY);
        }
    }

    canvas.mouseReleased = function() {
        if (canvas.mouseButton === canvas.CENTER) {
            let cvsObject = canvas.select('#bottomLayer');
            let posY = cvsObject.position().y;

            if (Math.abs(posY) <= 20) {
                posY = 0;
            }

            cvsObject.position(cvsObject.position().x, posY);
        }
    }

    canvas.windowResized = function() {
        let newWid = board.width();
        let newHei = board.height();

        let k = Math.max(canvas.width / newWid, canvas.height / newHei) / zoomValues[zoomIndex];

        canvas.resizeCanvas(canvas.width / k, canvas.height / k);
        canvas.background(255);

        changes.forEach(change => {
            change.handleResize(k);
            change.print();
        });

    }

}

// The top layer will hold the current addition.
let sketchTop = function (canvas) {
    // The currently selected drawing tool.
    let tool;

    // Tool for phone touchscreen recognition. To be used later.
    let hammer;

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas(wid, hei);
        cvsObject.mouseClicked(function () {
            tool.mouseClicked();
        });
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        cvsObject.id('topLayer');

        tool = new Polygon(canvas);
    }

    canvas.draw = function () {
        tool.draw();
    };

    canvas.mouseWheel = function() {
        canvas.windowResized();
    }

    canvas.keyReleased = function() {
        if (canvas.keyCode === canvas.ESCAPE) {
            tool.resetData();
        }
    }

    canvas.mouseDragged = function() {
        if (canvas.mouseButton === canvas.CENTER) {
            let cvsObject = canvas.select('#topLayer');

            cvsObject.position(cvsObject.position().x + canvas.movedX, cvsObject.position().y + canvas.movedY);
        }
    }

    canvas.mouseReleased = function() {
        if (canvas.mouseButton === canvas.CENTER) {
            let cvsObject = canvas.select('#topLayer');
            let posY = cvsObject.position().y;

            if (Math.abs(posY) <= 20) {
                posY = 0;
            }

            cvsObject.position(cvsObject.position().x, posY);
        }
    }

    canvas.windowResized = function() {
        let newWid = board.width();
        let newHei = board.height();

        console.log(zoomValues[zoomIndex]);
        let k = Math.max(canvas.width / newWid, canvas.height / newHei) / zoomValues[zoomIndex];

        canvas.resizeCanvas(canvas.width / k, canvas.height / k);

        tool.resetData();
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

    Tool.global_width = 1920;
    Tool.global_height = 1080;
    Tool.socket = socket;

    let k = Tool.global_width / Tool.global_height;
    if (wid / hei > k) {
        wid = hei * k;
    } else {
        hei = wid / k;
    }

    new p5(sketchBottom);
    new p5(sketchTop);
});