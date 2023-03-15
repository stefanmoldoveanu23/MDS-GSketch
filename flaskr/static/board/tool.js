// Abstract class representing any kind of tool used to sketch.
export class Tool{
    // Data resulting from the usage of the tool.
    data

    // The canvas that is drawn on.
    canvas

    // The socket for real-time communication.
    socket

    constructor(canvas, socket) {
        if (this.constructor === Tool) {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.canvas = canvas;
        this.socket = socket;
    }

    // Used in place of the canvas draw function.
    draw() { }

    // Used in place of the canvas mouseReleased function.
    mouseReleased() { }

    // Returns current mouse position.
    getMousePos() {
        return [this.canvas.mouseX, this.canvas.mouseY];
    }

    // Draws the data on the canvas.
    print() { }

    // Emits the data to the backend as an update.
    emit() {
        this.socket.emit('update', board_data._id, this.stringify());
    }

    // Serializes the data into a JSON format.
    stringify() { }
}