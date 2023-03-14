let socket = io('/board')

// bottom layer; holds full sketch
let sketchBottom = function(canvas) {
    let updates = []

    canvas.setup = function() {
        let cvsObject = canvas.createCanvas(canvas.windowWidth / 2, canvas.windowHeight / 2)
        cvsObject.parent('board')
        cvsObject.style('position', 'absolute')

        canvas.background(255)

        socket.on('getline', function(p1, p2) {
            updates.push([p1, p2])
        })
    }

    canvas.draw = function() {
        // draws a line immediately after receiving it from top layer
        updates.forEach(function(data) {
            canvas.line(data[0][0], data[0][1], data[1][0], data[1][1])
        })
        updates = []
    }

}

// top layer; holds active addition
let sketchTop = function(canvas) {
    let data = [[], [], []]

    canvas.setup = function() {
        let cvsObject = canvas.createCanvas(canvas.windowWidth / 2, canvas.windowHeight / 2)
        cvsObject.parent('board')
        cvsObject.style('position', 'absolute')
    }

    canvas.draw = function() {
        if ((data[2]).length !== 0) {
            // if line has been created, send it to bottom layer and clear top layer
            socket.emit('line', data[0], data[2])
            data = [[], [], []]
            canvas.clear()
        } else if ((data[0]).length !== 0) {
            // if user is currently choosing second point, draw preview of line to current mouse position
            if ((data[1]).length !== 0) {
                canvas.clear()
            }
            data[1] = [canvas.mouseX, canvas.mouseY]

            canvas.line(data[0][0], data[0][1], data[1][0], data[1][1])
        }
    }

    canvas.mouseReleased = function() {
        if ((data[0]).length === 0) {
            data[0] = [canvas.mouseX, canvas.mouseY]
        } else if ((data[2]).length === 0) {
            data[2] = [canvas.mouseX, canvas.mouseY]
        }
    }

}

$(document).ready(function() {
    new p5(sketchBottom)
    new p5(sketchTop)
})