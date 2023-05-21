import {Tool} from './tool.js'

// A tool that a user can write text with.
export class Text extends Tool {
    // The size of the textbox.
    size;
    // The x,y coordinates of the i-cursor in the text split in lines.
    textCoords;
    // The position of the i-cursor in the text.
    textPos;
    // The text split in lines.
    lines;
    // The time the i-cursor was moved last.
    lastMove;
    // Determines whether the text is being edited.
    editing;

    // The rate at which the i-cursor flickers(default = 750ms).
    static flickerRate = 750;

    constructor(canvas, data=[], editing=false) {
        super(canvas);

        this.data = data;
        this.editing = editing;
        this.setupParams();
    }

    // Sets up the parameters to their default values.
    setupParams() {
        this.textCoords = [0, 0];
        this.textPos = 0;
        this.size = [0, 1];
        this.lines = [""];
        this.lastMove = Math.floor(Date.now());
    }

    // Splits the text into lines and determines its size.
    getSize() {
        this.size = [0, 1];
        this.lines = [];
        let rowStart = 0;

        for (let i = 0; i < this.data[1].length; ++i) {
            if (this.data[1][i] === '\n') {
                ++this.size[1];
                this.size[0] = Math.max(this.size[0], this.canvas.textWidth(this.data[1].substring(rowStart, i)));
                this.lines.push(this.data[1].substring(rowStart, i));
                rowStart = i + 1;
            }
        }
        this.size[0] = Math.max(this.size[0], this.canvas.textWidth(this.data[1].substring(rowStart, this.data[1].length)));
        this.lines.push(this.data[1].substring(rowStart, this.data[1].length));

        this.size[1] *= (this.canvas.textAscent() + this.canvas.textDescent());
    }

    draw() {
        if (this.editing) {
            this.canvas.clear();
            this.print();
        } else {
            this.emit();
        }
    }

    mousePressed() {
        if (this.canvas.mouseButton === this.canvas.LEFT) {
            let mousePos = this.getMousePos();

            if (this.data.length === 0) {
                this.data.push(mousePos);
                this.data.push("");
            } else {
                let row = mousePos[1] - (this.data[0][1] - this.canvas.textAscent());
                if (0 > row || row > this.size[1]) {
                    this.editing = false;
                    return;
                }

                if (mousePos[0] < this.data[0][0] || mousePos[0] > this.data[0][0] + this.size[0]) {
                    this.editing = false;
                    return;
                }

                this.textPos = 0;
                this.textCoords = [0, 0];
                this.textCoords[0] = Math.floor(row / (this.canvas.textAscent() + this.canvas.textDescent()));
                for (let i = 0; i < this.textCoords[0]; ++i) {
                    this.textPos += this.lines[i].length;
                }

                for (let j = 0; j < this.lines[this.textCoords[0]].length; ++j) {
                    let lenSub = this.canvas.textWidth(this.lines[this.textCoords[0]].substring(0, j));
                    let halfLeft = ((j > 0) ? this.canvas.textWidth(this.lines[this.textCoords[0]][j - 1]) / 2 : 0);
                    let halfRight = this.canvas.textWidth(this.lines[this.textCoords[0]][j]) / 2;

                    if ((lenSub - halfLeft) <= (mousePos[0] - this.data[0][0]) && (mousePos[0] - this.data[0][0]) <= (lenSub + halfRight)) {
                        this.textPos += j;
                        this.textCoords[1] = j;
                        this.lastMove = Math.floor(Date.now());
                        return;
                    }
                }

                this.textPos += this.lines[this.textCoords[0]].length;
                this.textCoords[1] = this.lines[this.textCoords[0]].length;

                this.lastMove = Math.floor(Date.now());
            }
        }
    }

    keyTyped() {
        if (this.data.length !== 0) {
            let newKey = (this.canvas.key === "Enter" ? '\n' : this.canvas.key);
            this.data[1] = this.data[1].substring(0, this.textPos) + newKey + this.data[1].substring(this.textPos, this.data[1].length);
            this.getSize();
            this.moveRight();
            this.lastMove = Math.floor(Date.now());
        }
    }

    keyPressed() {
        if (this.data.length !== 0) {
            if (this.canvas.keyCode === this.canvas.BACKSPACE) {
                if (this.textPos !== 0) {
                    this.moveLeft();
                    this.data[1] = this.data[1].substring(0, this.textPos) + this.data[1].substring(this.textPos + 1, this.data[1].length);
                    this.getSize();
                }
            } else if (this.canvas.keyCode === this.canvas.LEFT_ARROW) {
                this.moveLeft();
            } else if (this.canvas.keyCode === this.canvas.RIGHT_ARROW) {
                this.moveRight();
            } else if (this.canvas.keyCode === this.canvas.UP_ARROW) {
                this.moveUp();
            } else if (this.canvas.keyCode === this.canvas.DOWN_ARROW) {
                this.moveDown();
            }
            this.lastMove = Math.floor(Date.now());
        }
    }

    print() {
        if (this.data.length === 0) {
            let previewPoint = this.getMousePos();
            this.canvas.noStroke();
            this.canvas.fill(0);
            this.canvas.text("Text goes here...", previewPoint[0], previewPoint[1]);
            this.canvas.fill(255);
            this.canvas.stroke(0);
        } else {
            this.canvas.noStroke();
            this.canvas.fill(0);
            this.canvas.text(this.data[1], this.data[0][0], this.data[0][1]);
            this.canvas.fill(255);
            this.canvas.stroke(0);

            if (this.editing) {
                if (!(Math.floor((Date.now() - this.lastMove) / Text.flickerRate) % 2)) {
                    let width = this.canvas.textWidth(this.lines[this.textCoords[0]].substring(0, this.textCoords[1]));
                    let h1 = this.textCoords[0] * (this.canvas.textAscent() + this.canvas.textDescent());
                    let h2 = (this.textCoords[0] + 1) * (this.canvas.textAscent() + this.canvas.textDescent());
                    this.canvas.line(this.data[0][0] + width, this.data[0][1] - this.canvas.textAscent() + h1, this.data[0][0] + width, this.data[0][1] - this.canvas.textAscent() + h2);
                }
            }
        }
    }


    // Moves the i-cursor one character left.
    moveLeft() {
        if (this.textCoords[1] === 0) {
            if (this.textCoords[0] !== 0) {
                --this.textCoords[0];
                this.textCoords[1] = this.lines[this.textCoords[0]].length;
            }
        } else {
            --this.textCoords[1];
        }

        this.textPos = Math.max(this.textPos - 1, 0);
    }

    // Moves the i-cursor one character right.
    moveRight() {
        if (this.textCoords[1] === this.lines[this.textCoords[0]].length) {
            if (this.textCoords[0] !== this.lines.length - 1) {
                ++this.textCoords[0];
                this.textCoords[1] = 0;
            }
        } else {
            ++this.textCoords[1];
        }

        this.textPos = Math.min(this.textPos + 1, this.data[1].length);
    }

    // Moves the i-cursor one row up.
    moveUp() {
        if (this.textCoords[0] === 0) {
            this.textCoords[1] = 0;
            this.textPos = 0;
        } else {
            this.textPos -= (this.textCoords[1] + 1);
            this.textCoords[0] -= 1;
            for (let j = this.lines[this.textCoords[0]].length; j >= 0; --j) {
                if (this.canvas.textWidth(this.lines[this.textCoords[0]].substring(0, j)) <= this.canvas.textWidth(this.lines[this.textCoords[0] + 1].substring(0, this.textCoords[1]))) {
                    this.textCoords[1] = j;
                    this.textPos -= (this.lines[this.textCoords[0]].length - j);
                    break;
                }
            }
        }
    }

    // Moves the i-cursor one row down.
    moveDown() {
        if (this.textCoords[0] === this.lines.length - 1) {
            this.textCoords[1] = this.lines[this.textCoords[0]].length;
            this.textPos = this.data[1].length;
        } else {
            this.textPos += (this.lines[this.textCoords[0]].length - this.textCoords[1] + 1);
            this.textCoords[0] += 1;
            for (let j = 0; j <= this.lines[this.textCoords[0]].length; ++j) {
                if (this.canvas.textWidth(this.lines[this.textCoords[0]].substring(0, j)) >= this.canvas.textWidth(this.lines[this.textCoords[0] - 1].substring(0, this.textCoords[1])) || j === this.lines[this.textCoords[0]].length) {
                    this.textCoords[1] = j;
                    this.textPos += j;
                    break;
                }
            }
        }
    }

    handleResize(k) {
        if (this.data.length !== 0) {
            this.data[0] = [this.data[0][0] / k, this.data[0][1] / k];
        }
    }

    resetData() {
        super.resetData();
        this.data = [];
        this.editing = true;

        this.setupParams();
    }

    stringify() {
        return JSON.stringify({
            "name": "write_text",
            "params": this.data
        });
    }
}