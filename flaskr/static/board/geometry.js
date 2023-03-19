import {Tool} from './tool.js'

// Abstract class for geometric objects: lines, triangles, squares, polygons, etc.
class Geometry extends Tool {
    // Until the figure is closed, use the current position of the mouse to build a preview.
    previewPoint

    // Total number of points that represent the figure.
    cntPoints

    // Color of the figure.
    color

    constructor(canvas, socket, cntPoints, color) {
        super(canvas, socket);
        if (this.constructor === Geometry)  {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.cntPoints = cntPoints;
        this.color = color
    }

    draw() {
        if (this.data[this.cntPoints - 1] !== null) {
            // If the figure has been completed, send the data to the other users.
            this.emit();
            this.data = new Array(this.cntPoints).fill(null);
            this.canvas.clear();
        } else {
            // Otherwise, print the data on the canvas.
            this.print();
        }
    }

    mouseReleased() {
        // Insert the current mouse position into the next open space.
        for (let i = 0; i < this.cntPoints; ++i) {
            if (this.data[i] === null) {
                this.data[i] = this.getMousePos();
                break;
            }
        }
    }

    emit() {
        super.emit();
    }
}

export class Line extends Geometry {
    constructor(canvas, socket, color, data=[null, null]) {
        super(canvas, socket, 2, color);
        this.data = data;
    }

    print() {
        this.canvas.stroke(this.color);
        if (this.data[1] !== null) {
            this.canvas.line(this.data[0][0], this.data[0][1], this.data[1][0], this.data[1][1]);
        } else if (this.data[0] !== null) {
            if (this.previewPoint !== null) {
                this.canvas.clear();
            }
            this.previewPoint = this.getMousePos();

            this.canvas.line(this.data[0][0], this.data[0][1], this.previewPoint[0], this.previewPoint[1]);
        }
    }

    stringify() {
        return JSON.stringify({
            "name": "create_line",
            "color":this.color,
            "params": this.data
        });
    }
}


export class Triangle extends Geometry {
    constructor(canvas, socket, color, data=[null, null, null]) {
        super(canvas, socket, 3,color);

        this.data = data;
    }

    print() {
        this.canvas.stroke(this.color);
        if (this.data[2] !== null) {
            this.canvas.noFill();
            this.canvas.triangle(this.data[0][0], this.data[0][1], this.data[1][0], this.data[1][1], this.data[2][0], this.data[2][1]);
            this.canvas.fill(255);
        } else if (this.data[1] !== null) {
            this.canvas.clear();
            this.previewPoint = this.getMousePos();

            this.canvas.noFill();
            this.canvas.triangle(this.data[0][0], this.data[0][1], this.data[1][0], this.data[1][1], this.previewPoint[0], this.previewPoint[1]);
            this.canvas.fill(255);
        } else if (this.data[0] !== null) {
            if (this.previewPoint !== null) {
                this.canvas.clear();
            }

            this.previewPoint = this.getMousePos();
            this.canvas.line(this.data[0][0], this.data[0][1], this.previewPoint[0], this.previewPoint[1]);
        }
    }

    stringify() {
        return JSON.stringify({
            "name": "create_triangle",
            "color":this.color,
            "params": this.data
        });
    }
}