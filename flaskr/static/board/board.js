import {Tool} from "./tool.js";
import {Circle, Ellipse, Line, Polygon, Rectangle, Triangle} from "./geometry.js";
import {FountainPen, Pen} from "./brush.js";

Tool.get_object = function (canvas, json)  {
    let handlers = {
        "create_line": new Line(canvas, json.color, json.params),
        "create_triangle": new Triangle(canvas, json.color, json.params),
        "create_rectangle": new Rectangle(canvas, json.color, json.params),
        "create_polygon": new Polygon(canvas, json.color, json.params),
        "create_ellipse": new Ellipse(canvas, json.color, json.params),
        "create_circle": new Circle(canvas, json.color, json.params),
        "draw_pen": new Pen(canvas, json.params),
        "draw_fountain_pen": new FountainPen(canvas, json.params)
    };
    return handlers[json.name];
}

// The socket that facilitates real-time communication.
let socket = io('/board');

// This array accumulates all changes done to the board.
let changes = [];

// This array accumulates pending changes to the board.
let pending = [];

// Immediately after we get a connection, request the board data.
socket.on("connect", function () {
    socket.emit("get_data");
})

// We received the board data from the server.
socket.on("data", function (data) {
    // Disabled loading screen
    $(".loader-wrapper").fadeOut("slow");
    $(".board-cont").fadeIn("slow");

    pending = []
    let changes = JSON.parse(data)
    console.log(changes)
    changes.forEach(function (change) {
        pending.push(change)
    })

    Tool.socket = socket;

    let k = Tool.global_width / Tool.global_height;
    if (wid / hei > k) {
        wid = hei * k;
    } else {
        hei = wid / k;
    }

    // Create the board
    new p5(sketchBottom);
    new p5(sketchTop);
})


// On receiving changes, add them into the pending list.
socket.on('update', function (update) {
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
// Width of board.
let wid = board.width();
// Height of board.
let hei = board.height();

// The list of table zoom values.
let zoomValues = [1/4, 1/3, 1/2, 2/3, 3/4, 4/5, 9/10, 1, 11/10, 5/4, 3/2, 7/4, 2, 5/2, 3, 4, 5];
// The index pointing to the current zoom value.
let zoomIndex = 7;
// Global value that retains the mouse shift over the board when the user zooms.
let mouseDelta = [];

// The bottom layer will hold the full sketch.
let sketchBottom = function (canvas) {

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas(wid, hei);
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        cvsObject.id('bottomLayer');

        canvas.background(255);
    }

    // Draw every object in the pending list.
    canvas.draw = function () {
        pending.forEach(function (update) {
            apply_update(canvas, update);
        });
        pending = [];
    }

    // Find the new zoomIndex, the difference between the last and new mouse position(mouseDelta), resize the canvas
    // and move it so that the mouse stays in the same relative position.
    canvas.mouseWheel = function(event) {
        let lastZoom = zoomValues[zoomIndex];
        zoomIndex -= Math.floor(event.delta > 0 ? 1 : -1);

        zoomIndex = Math.max(zoomIndex, 0);
        zoomIndex = Math.min(zoomIndex, zoomValues.length - 1);
        let currZoom = zoomValues[zoomIndex];

        let k = lastZoom / currZoom;

        let lastMousePos = [canvas.mouseX, canvas.mouseY];
        let newMousePos = [lastMousePos[0] / k, lastMousePos[1] / k];
        mouseDelta = [newMousePos[0] - lastMousePos[0], newMousePos[1] - lastMousePos[1]];
        canvas.windowResized();
        let cvsObject = canvas.select('#bottomLayer');
        canvas.mouseX = newMousePos[0];
        canvas.mouseY = newMousePos[1];

        cvsObject.position(cvsObject.position().x - mouseDelta[0], cvsObject.position().y - mouseDelta[1]);
        return false;
    }

    // When dragging the mouse while holding the center button, move the canvas object accordingly.
    canvas.mouseDragged = function() {
        if (canvas.mouseButton === canvas.CENTER) {
            let cvsObject = canvas.select('#bottomLayer');

            cvsObject.position(cvsObject.position().x + canvas.movedX, cvsObject.position().y + canvas.movedY);
        }
    }

    // When the user stops dragging the center button of the mouse, the canvas stops moving, and it checks whether
    // it's close enough to any margin to snap to.
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

    // Resizes the canvas and redraws every object scaled properly.
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

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas(wid, hei);
        cvsObject.mouseClicked(function () {
            tool.mouseClicked();
        });
        cvsObject.mouseReleased(function () {
            tool.mouseReleased();
        });
        cvsObject.mousePressed(function() {
            tool.mousePressed();
        });
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        cvsObject.id('topLayer');

        // The tool will eventually be assigned values by pressing the buttons; therefore it will most likely be made global.
        let color = $('#picker').val();
        tool = new Triangle(canvas, color);

        let colorpicker = $("#picker").data("kendoColorPicker");
        colorpicker.bind("change", function (e) {
            color = e.value;
            tool.color = e.value;
        })

        $('.tools').click(function (event) {
            let selected;
            if ($(event.target).is('i')) {
                $(".tools").find('div').removeClass("clicked");
                $(event.target).parent().addClass("clicked");
                selected = $(event.target).parent().attr('id');
            }
            if ($(event.target).is('svg')) {
                $(".tools").find('div').removeClass("clicked");
                $(event.target).parent().addClass("clicked");
                selected = $(event.target).parent().attr('id');
            }
            if ($(event.target).is('path')) {
                $(".tools").find('div').removeClass("clicked");
                $(event.target).parent().parent().addClass("clicked");
                selected = $(event.target).parent().parent().attr('id');
            }
            if ($(event.target).hasClass('box')) {
                $(".tools").find('div').removeClass("clicked");
                $(event.target).addClass("clicked");
                selected = $(event.target).attr('id');
            }
            if (selected === 'pencil')
                tool = new Pen(canvas, color);
            if (selected === 'fountain_pen')
                tool = new FountainPen(canvas, color);
            if (selected === 'triangle')
                tool = new Triangle(canvas, color);
            if (selected === 'line')
                tool = new Line(canvas, color);
            if (selected === 'square')
                tool = new Rectangle(canvas, color);
            if (selected === 'circle')
                tool = new Circle(canvas, color);
            if (selected === 'ellipse')
                tool = new Ellipse(canvas, color);
            if (selected === 'poligon')
                tool = new Polygon(canvas, color);

        });
    }

    canvas.draw = function () {
        tool.draw();
    };

    // Uses the already computed mouseDelta and zoomIndex to resize the canvas and move it properly.
    canvas.mouseWheel = function() {
        canvas.windowResized();

        let cvsObject = canvas.select('#topLayer');

        let lastMousePos = [canvas.mouseX, canvas.mouseY];
        canvas.mouseX = mouseDelta[0] + lastMousePos[0];
        canvas.mouseY = mouseDelta[1] + lastMousePos[1];

        cvsObject.position(cvsObject.position().x - mouseDelta[0], cvsObject.position().y - mouseDelta[1]);
    }

    // When the user presses ESC the current object being drawn gets deleted.
    canvas.keyReleased = function() {
        if (canvas.keyCode === canvas.ESCAPE) {
            tool.resetData();
        }
    }

    // When the mouse is dragged while holding the center button the canvas object moves by the proper distance.
    canvas.mouseDragged = function() {
        if (canvas.mouseButton === canvas.CENTER) {
            let cvsObject = canvas.select('#topLayer');

            cvsObject.position(cvsObject.position().x + canvas.movedX, cvsObject.position().y + canvas.movedY);
        }
    }

    // When the user stops dragging the center button of the mouse, the canvas stops moving, and it checks whether
    // it's close enough to any margin to snap to.
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

    // Resizes the canvas and redraws the object being drawn scaled properly.
    canvas.windowResized = function() {
        let newWid = board.width();
        let newHei = board.height();

        let k = Math.max(canvas.width / newWid, canvas.height / newHei) / zoomValues[zoomIndex];

        canvas.resizeCanvas(canvas.width / k, canvas.height / k);

        //TODO: fix tool resize bug
        //tool.handleResize(k);
    }

}
