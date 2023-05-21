import {Tool} from './tool.js'

// Abstract class for geometric objects: lines, triangles, squares, polygons, etc.
class Geometry extends Tool {
    // Until the figure is closed, use the current position of the mouse to build a preview.
    previewPoint

    // Total number of points that represent the figure.
    cntPoints

    // Color of the figure.
    color

    constructor(canvas, cntPoints, color) {
        super(canvas);

        if (this.constructor === Geometry)  {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.cntPoints = cntPoints;
        this.color = color;
    }

    draw() {
        if (this.data[this.cntPoints - 1] !== null) {
            // If the figure has been completed, send the data to the other users.
            this.emit();
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

    dist(a, b) {
        return Math.abs(Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2));
    }
}

// Tool that draws a line.
export class Line extends Geometry {
    constructor(canvas, color, data=[null, null]) {
        super(canvas, 2, color);
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

// Tool that draws a triangle.
export class Triangle extends Geometry {
    constructor(canvas, color, data=[null, null, null]) {
        super(canvas, 3, color);
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

    stringify(object) {
        return JSON.stringify({
            "name": "create_triangle",
            "color":this.color,
            "params": this.data
        });
    }
}

// Tool that draws a rectangle.
export class Rectangle extends Geometry {
    constructor(canvas, color, data=[null, null]) {
        super(canvas, 2, color);
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
            "color":this.color,
            "params": this.data
        });
    }
}

// Tool that draws a polygon.
export class Polygon extends Geometry {
    // The radius of the circle inside which the user can complete the polygon.
    snapRadius = 10;

    constructor(canvas, color, data = [null]) {
        super(canvas, data.length, color);

        this.data = data;
    }

    // Returns the distance between two points.
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
            this.canvas.fill(255);
            this.canvas.stroke(0);
        }

        this.canvas.noFill();
        this.canvas.beginShape();
        for (let i = 0; i < this.cntPoints - 1; ++i) {
            this.canvas.vertex(this.data[i][0], this.data[i][1]);
        }

        if (this.cntPoints > 1 && this.data[this.cntPoints - 1] === null) {
            this.previewPoint = this.getMousePos();
            if (this.dist(this.previewPoint, this.data[0]) < this.snapRadius) {
                this.previewPoint = this.data[0];
            }

            this.canvas.vertex(this.previewPoint[0], this.previewPoint[1]);
            this.canvas.vertex(this.data[0][0], this.data[0][1]);
        } else if (this.data[this.cntPoints - 1] !== null) {
            this.canvas.vertex(this.data[this.cntPoints - 1][0], this.data[this.cntPoints - 1][1]);
        }
        this.canvas.endShape();
        this.canvas.fill(255);
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
            "color":this.color,
            "params": this.data
        });
    }

    resetData() {
        this.canvas.clear();
        this.data = [null];
        this.cntPoints = 1;
    }
}

// Tool that draws an ellipse.
export class Ellipse extends Geometry {
    // Holds the rotation of the ellipse.
    rotation;

    constructor(canvas, color, data=[null, null, null]) {
        super(canvas, 3, color);
        this.data = data;
    }

    // Returns the projection of point c on the line (a, b).
    getProjection(a, b, c) {
        let ab = ((b[0] - a[0]) * (c[0] - a[0]) + (b[1] - a[1]) * (c[1] - a[1])) / ((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2);
        return [a[0] + (b[0] - a[0]) * ab, a[1] + (b[1] - a[1]) * ab];
    }

    getRotation(a, b) {
        return Math.atan2(b[1] - a[1], b[0] - a[0]);
    }

    print() {
        if (this.data[2] !== null) {
            this.rotation = this.getRotation(this.data[0], this.data[1]);
            let projection = this.getProjection(this.data[0], this.data[1], this.data[2]);

            this.canvas.noFill();
            this.canvas.translate(this.data[0][0], this.data[0][1]);
            this.canvas.rotate(this.rotation);
            this.canvas.ellipse(0, 0, this.dist(this.data[0], this.data[1]) * 2, this.dist(this.data[2], projection) * 2);
            this.canvas.rotate(-this.rotation);
            this.canvas.translate(-this.data[0][0], -this.data[0][1]);
            this.canvas.fill(255);
        } else if (this.data[1] !== null) {
            this.canvas.clear();
            this.canvas.translate(this.data[0][0], this.data[0][1]);
            this.canvas.rotate(this.rotation);

            this.previewPoint = this.getMousePos();

            this.rotation = this.getRotation(this.data[0], this.data[1]);
            let projection = this.getProjection(this.data[0], this.data[1], this.previewPoint);

            this.canvas.noFill();
            this.canvas.ellipse(0, 0, this.dist(this.data[0], this.data[1]) * 2, this.dist(this.previewPoint, projection) * 2);
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
            "name": "create_ellipse",
            "color":this.color,
            "params": this.data
        });
    }
}

// Tool that draws a circle.
export class Circle extends Geometry {
    constructor(canvas, color, data = [null, null]) {
        super(canvas, 2, color);
        this.data = data;
    }

    print() {
        if (this.data[1] !== null) {
            this.canvas.noFill();
            this.canvas.ellipse(this.data[0][0], this.data[0][1], this.dist(this.data[0], this.data[1]) * 2, this.dist(this.data[0], this.data[1]) * 2);
            this.canvas.fill(255);
        } else if (this.data[0] !== null) {
            this.canvas.clear();
            this.previewPoint = this.getMousePos();

            this.canvas.noFill();
            this.canvas.ellipse(this.data[0][0], this.data[0][1], this.dist(this.data[0], this.previewPoint) * 2, this.dist(this.data[0], this.previewPoint) * 2);
            this.canvas.fill(255);
        }
    }

    stringify(object) {
        return JSON.stringify({
            "name": "create_circle",
            "color":this.color,
            "params": this.data
        });
    }
}