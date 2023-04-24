import {Line, Triangle} from './geometry.js';

let socket = io('/board');

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

    // Create the board
    new p5(sketchBottom);
    new p5(sketchTop);
})


// On receiving changes, add them into the pending list.
socket.on('update', function (update) {
    socket.emit('save', board_data._id);
    pending.push(JSON.parse(update));
});

// If there was an error with the database, force exit every user to the home page.
socket.on('database-error', function() {
    alert("There was an error with the database.");
    document.location.href = "/";
});

// Apply the update to the canvas.
function apply_update(canvas, update) {
    let handlers = {
        "create_line": new Line(canvas, socket, update.color, update.params),
        "create_triangle": new Triangle(canvas, socket,  update.color, update.params)
    }
    let handler = handlers[update.name];
    handler.print();
}


// Bottom layer; holds full sketch.
let sketchBottom = function (canvas) {

    canvas.setup = function () {
        let cvsObject = canvas.createCanvas( window.innerWidth,  window.innerHeight);
        cvsObject.parent('board');

        // Draw the image from the database.
        canvas.loadPixels();
        for (let i = 0; i < board_data.width; ++i) {
            for (let j = 0; j < board_data.height; ++j) {
                let index = 4 * (i * board_data.height + j);
                canvas.pixels[index] = board_data.baseImage[index].charCodeAt(0);
                canvas.pixels[index + 1] = board_data.baseImage[index + 1].charCodeAt(0);
                canvas.pixels[index + 2] = board_data.baseImage[index + 2].charCodeAt(0);
                canvas.pixels[index + 3] = board_data.baseImage[index + 3].charCodeAt(0);
            }
        }
        canvas.updatePixels();
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
        let cvsObject = canvas.createCanvas(window.innerWidth,  window.innerHeight);
        cvsObject.mouseReleased(function () {
            tool.mouseReleased();
        });
        cvsObject.parent('board');
        cvsObject.style('position', 'absolute');

        // The tool will eventually be assigned values by pressing the buttons; therefore it will most likely be made global.
        let color = $('#picker').val();
        tool = new Triangle(canvas, socket, color);

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
            if (selected === 'triangle')
                tool = new Triangle(canvas, socket, color);
            if (selected === 'line')
                tool = new Line(canvas, socket, color);
        });
    }

    canvas.draw = function () {
        tool.draw();
    };


}

