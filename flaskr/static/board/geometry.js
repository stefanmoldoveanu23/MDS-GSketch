import {Tool} from './tool.js'

// Abstract class for geometric objects: lines, triangles, squares, polygons, etc.
class Geometry extends Tool {
    // Until the figure is closed, use the current position of the mouse to build a preview.
    previewPoint

    // Total number of points that represent the figure.
    cntPoints

    constructor(canvas, cntPoints) {
        super(canvas);
        if (this.constructor === Geometry)  {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.cntPoints = cntPoints;
        this.data = new Array(this.cntPoints).fill(null);
    }

    draw() {
        if (this.data[this.cntPoints - 1] !== null) {
            // If the figure has been completed, send the data to the other users.
            this.emit();
            this.resetData();
        } else {
            // Otherwise, print the data on the canvas.
            this.print();
        }
    }

    mouseClicked() {
        // Insert the current mouse position into the next open space.
        for (let i = 0; i < this.cntPoints; ++i) {
            if (this.data[i] === null) {
                this.data[i] = this.getMousePos();
                break;
            }
        }
    }

    resetData() {
        super.resetData();
        this.data = new Array(this.cntPoints).fill(null);
    }

    handleResize(k) {
        for (let i = 0; i < this.cntPoints; ++i) {
            if (this.data[i] === null) {
                break;
            }

            this.data[i] = [this.data[i][0] / k, this.data[i][1] / k];
        }
    }

    stringify() { }
}

export class Line extends Geometry {
    constructor(canvas, data=[null, null]) {
        super(canvas, 2);
        this.data = data;
    }

    print() {
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
            "params": this.data
        });
    }
}


export class Triangle extends Geometry {
    constructor(canvas, data=[null, null, null]) {
        super(canvas, 3);

        this.data = data;
    }

    print() {
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

    stringify(object) {
        return JSON.stringify({
            "name": "create_triangle",
            "params": this.data
        });
    }
}


export class Rectangle extends Geometry {
    constructor(canvas, data=[null, null]) {
        super(canvas, 2);
        this.data = data;
    }

    print() {
        if (this.data[1] !== null) {
            this.canvas.noFill();
            this.canvas.rect(this.data[0][0], this.data[0][1], this.data[1][0] - this.data[0][0], this.data[1][1] - this.data[0][1]);
            this.canvas.fill(255);
        } else if (this.data[0] !== null) {
            this.canvas.clear();
            this.previewPoint = this.getMousePos();

            this.canvas.noFill();
            this.canvas.rect(this.data[0][0], this.data[0][1], this.previewPoint[0] - this.data[0][0], this.previewPoint[1] - this.data[0][1]);
            this.canvas.fill(255);
        }
    }

    stringify(object) {
        return JSON.stringify({
            "name": "create_rectangle",
            "params": this.data
        });
    }
}


export class Polygon extends Geometry {
    snapRadius = 10;

    constructor(canvas, data=[null]) {
        super(canvas, data.length);

        this.data = data;
    }

    dist(a, b) {
        return Math.abs(Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2));
    }

    print() {
        if (this.cntPoints > 1 && this.data[this.cntPoints - 1] === null) {
            this.canvas.clear();
        }

        if (this.data[0] !== null && this.data[this.cntPoints - 1] === null) {
            this.canvas.noStroke();
            this.canvas.fill('rgba(0, 255, 255, 0.25)');
            this.canvas.ellipse(this.data[0][0], this.data[0][1], this.snapRadius, this.snapRadius);
            this.canvas.noFill();
            this.canvas.stroke(0);
        }

        for (let i = 1; i < this.cntPoints - 1; ++i) {
            this.canvas.line(this.data[i - 1][0], this.data[i - 1][1], this.data[i][0], this.data[i][1]);
        }

        if (this.cntPoints > 1 && this.data[this.cntPoints - 1] === null) {
            this.previewPoint = this.getMousePos();
            if (this.dist(this.previewPoint, this.data[0]) < this.snapRadius) {
                this.previewPoint = this.data[0];
            }

            this.canvas.line(this.data[this.cntPoints - 2][0], this.data[this.cntPoints - 2][1], this.previewPoint[0], this.previewPoint[1])
            this.canvas.line(this.previewPoint[0], this.previewPoint[1], this.data[0][0], this.data[0][1]);
        } else if (this.data[this.cntPoints - 1] !== null) {
            this.canvas.line(this.data[this.cntPoints - 2][0], this.data[this.cntPoints - 2][1], this.data[this.cntPoints - 1][0], this.data[this.cntPoints - 1][1])
        }
    }

    mouseClicked() {
        let currPos = this.getMousePos();
        if (this.data[0] === null) {
            this.data[0] = currPos;

            ++this.cntPoints;
            this.data.push(null);
            return;
        }

        if (this.dist(currPos, this.data[0]) < this.snapRadius) {
            this.data[this.cntPoints - 1] = this.data[0];
        } else {
            this.data[this.cntPoints - 1] = currPos;
            ++this.cntPoints;
            this.data.push(null);
        }
    }

    stringify(object) {
        return JSON.stringify({
            "name": "create_polygon",
            "params": this.data
        });
    }

    resetData() {
        this.canvas.clear();
        this.data = [null];
        this.cntPoints = 1;
    }
}