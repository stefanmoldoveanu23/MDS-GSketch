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
            if (this.data.length === 0 || (this.getMousePos()[0] !== this.data[this.data.length - 1][0] || this.getMousePos()[1] !== this.data[this.data.length - 1][1])) {
                this.data.push(this.getMousePos());
            }
            this.print();
        }
    }

    mousePressed() {
        if (this.canvas.mouseButton !== this.canvas.LEFT) {
            return;
        }

        while (this.emitting) { }

        this.data = [this.getMousePos()];
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
            let v1 = canvas.createVector(p1[0], p1[1]);
            let v2 = canvas.createVector(p2[0], p2[1]);
            let dist = v1.dist(v2);

            for (let i = 0; i < dist; ++i) {
                let v = v1.lerp(v2, i / dist);

                canvas.line(v.x - FountainPen.delta[0], v.y + FountainPen.delta[1], v.x + FountainPen.delta[0], v.y - FountainPen.delta[1]);
            }

            canvas.line(p2[0] - FountainPen.delta[0], p2[1] + FountainPen.delta[1], p2[0] + FountainPen.delta[0], p2[1] - FountainPen.delta[1]);
        });
    }

    stringify() {
        return JSON.stringify({
            "name": "draw_fountain_pen",
            "params": this.data
        });
    }
}