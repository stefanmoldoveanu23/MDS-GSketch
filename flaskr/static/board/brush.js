import {Tool} from './tool.js'

// Abstract class for brushes: pen, fountain pen, airbrush, and eraser.
class Brush extends Tool {
    // Function that draws between two points.
    interpolation;

    // Variable that tells when the user is drawing.
    drawing;

    // Variable that tells if data is being emitted.
    emitting;

    constructor(canvas, data, interpolation=function() {}) {
        super(canvas);
        if (this.constructor === Brush) {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.drawing = false;
        this.emitting = false;

        this.data = data;
        this.interpolation = interpolation;
    }

    draw() {
        if (this.drawing) {
            this.canvas.clear();
            this.data.push(this.getMousePos());
            this.print();
        }
    }

    mousePressed() {
        if (this.canvas.mouseButton !== this.canvas.LEFT) {
            return;
        }

        while (this.emitting) { }

        this.data.push(this.getMousePos());
        this.drawing = true;
    }

    mouseReleased() {
        this.emitting = true;
        if (this.canvas.mouseButton !== this.canvas.LEFT) {
            this.emitting = false;
            return;
        }

        this.drawing = false;
        this.data.push(this.getMousePos());
        this.emit();
        this.emitting = false;
    }

    handleResize(k) {
        for (let i = 0; i < this.data.length; ++i) {
            this.data[i] = [this.data[i][0] / k, this.data[i][1] / k];
        }
    }

    resetData() {
        this.data = [];
        super.resetData();
    }

    print() {
        for (let i = 1; i < this.data.length; ++i) {
            this.interpolation(this.data[i - 1], this.data[i]);
        }
    }

}

// A tool that imitates a pen.
export class Pen extends Brush {
    constructor(canvas, data=[]) {
        super(canvas, data, function(p1, p2) {
            canvas.line(p1[0], p1[1], p2[0], p2[1]);
        });
    }

    stringify() {
        return JSON.stringify({
            "name": "draw_pen",
            "params": this.data
        });
    }
}

// A tool that imitates a fountain pen.
export class FountainPen extends Brush {
    // Holds the delta distance of the fountain pen line.
    static delta = [2, 2];

    constructor(canvas, data=[]) {
        super(canvas, data, function(p1, p2) {
            let A = [p1[0] - FountainPen.delta[0], p1[1] + FountainPen.delta[1]];
            let B = [p1[0] + FountainPen.delta[0], p1[1] - FountainPen.delta[1]];
            let C = [p2[0] + FountainPen.delta[0], p2[1] - FountainPen.delta[1]];
            let D = [p2[0] - FountainPen.delta[0], p2[1] + FountainPen.delta[1]];

            canvas.fill(0);
            canvas.quad(A[0], A[1], B[0], B[1], C[0], C[1], D[0], D[1]);
            canvas.fill(255);
        });
    }

    stringify() {
        return JSON.stringify({
            "name": "draw_fountain_pen",
            "params": this.data
        });
    }
}

// A tool that imitates an airbrush.
export class AirBrush extends Brush {
    // The number of points the airbrush draws.
    static power = 20;

    // The radius of the airbrush.
    radius = 10;

    constructor(canvas, data=[]) {
        // The first element of data is the seed.
        if (data.length === 0) {
            data.push(canvas.random());
        }

        super(canvas, data, function(p1, p2) {
            for (let i = 0; i < AirBrush.power; ++i) {
                let polar = [canvas.random(this.radius), canvas.random(2 * canvas.PI)];
                canvas.point(p2[0] + polar[0] * canvas.cos(polar[1]), p2[1] + polar[0] * canvas.sin(polar[1]));
            }
        });
    }

    print() {
        this.canvas.randomSeed(this.data[0]);
        super.print();
    }

    handleResize(k) {
        this.radius /= k;

        for (let i = 1; i < this.data.length; ++i) {
            this.data[i] = [this.data[i][0] / k, this.data[i][1] / k];
        }
    }

    resetData() {
        super.resetData();
        this.data = [this.canvas.random(1000)];
    }

    stringify() {
        return JSON.stringify({
            "name": "draw_airbrush",
            "params": this.data
        });
    }
}

// A tool that a user can erase with.
export class Eraser extends Brush {
    // The radius of the eraser.
    static radius = 10;

    constructor(canvas, data=[]) {
        super(canvas, data, function(p1, p2) {
            canvas.noStroke();
            canvas.circle(p1[0], p1[1], 2 * Eraser.radius);

            let vector = [p2[0] - p1[0], p2[1] - p1[1]];
            let perpendicular;
            if (vector[0] === 0) {
                perpendicular = [Eraser.radius, 0];
            } else {
                perpendicular = [0, Eraser.radius / (Math.sqrt(1 + Math.pow(vector[1] / vector[0], 2)))];
                perpendicular[0] = perpendicular[1] * vector[1] / vector[0];
            }

            let A = [p1[0] - perpendicular[0], p1[1] + perpendicular[1]];
            let B = [p1[0] + perpendicular[0], p1[1] - perpendicular[1]];
            let C = [p2[0] + perpendicular[0], p2[1] - perpendicular[1]];
            let D = [p2[0] - perpendicular[0], p2[1] + perpendicular[1]];
            canvas.quad(A[0], A[1], B[0], B[1], C[0], C[1], D[0], D[1]);

            canvas.circle(p2[0], p2[1], 2 * Eraser.radius);
            canvas.stroke(0);
        });
    }

    stringify() {
        return JSON.stringify({
            "name": "erase",
            "params": this.data
        });
    }
}