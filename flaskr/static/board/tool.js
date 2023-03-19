// Abstract class representing any kind of tool used to sketch.
export class Tool{
    // Data resulting from the usage of the tool.
    data;

    // The canvas that is drawn on.
    canvas;

    // The socket for real-time communication.
    static socket;

    constructor(canvas) {
        if (this.constructor === Tool) {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.canvas = canvas;
    }

    // Used in place of the canvas draw function.
    draw() { }

    // Used in place of the canvas mouseReleased function.
    mouseReleased() { }

    // Returns current mouse position.
    getMousePos() {
        return [this.canvas.mouseX, this.canvas.mouseY];
    }

    handleResize(k) { }

    // Draws the data on the canvas.
    print() { }

    // Emits the data to the backend as an update.
    emit() {
        let object = this.clone();
        console.log("Sending: ", Math.max(object.canvas.width / 1920, object.canvas.height / 1080));
        object.handleResize(Math.max(object.canvas.width / 1920, object.canvas.height / 1080));

        Tool.socket.emit('update', object.stringify());
    }

    // Serializes the data into a JSON format.
    stringify() { }

    // Returns a tool with the correct typing from a json object.
    static get_object(canvas, json) { }

    // Returns a deep clone of the tool.
    clone() {
        console.log(this.stringify());
        return Tool.get_object(this.canvas, JSON.parse(this.stringify()));
    }
}