// Abstract class representing any kind of tool used to sketch.
export class Tool{
    // Global board width.
    static global_width = 1920;

    // Global board height.
    static global_height = 1080;

    // The socket for real-time communication.
    static socket;

    // Data resulting from the usage of the tool.
    data;

    // Color of the tool.
    color;

    // The canvas that is drawn on.
    canvas;

    constructor(canvas, color) {
        if (this.constructor === Tool) {
            throw new Error("Object of abstract class cannot be instantiated.");
        }

        this.canvas = canvas;
        this.color = color;
    }

    // Used in place of the canvas draw function.
    draw() { }

    // Used in place of the canvas mousePressed function.
    mousePressed() { }

    // Used in place of the canvas mouseClicked function.
    mouseClicked() { }

    // Used in place of the canvas mouseReleased function.
    mouseReleased() { }

    // Used in place of the canvas keyTyped function.
    keyTyped() { }

    // Used in place of the canvas keyPressed function.
    keyPressed() { }

    // Returns current mouse position.
    getMousePos() {
        return [this.canvas.mouseX, this.canvas.mouseY];
    }

    // Handles the resize of the canvas by a multiplier of k.
    handleResize(k) { }

    // Resets the data of the tool.
    resetData() {
        this.canvas.clear();
    }

    // Draws the data on the canvas.
    print() { }

    // Emits the data to the backend as an update.
    emit() {
        let object = this.clone();
        object.handleResize(Math.max(object.canvas.width / Tool.global_width, object.canvas.height / Tool.global_height));

        Tool.socket.emit('update', object.stringify());
        this.resetData();
    }

    // Serializes the data into a JSON format.
    stringify() { }

    // Returns a tool with the correct typing from a json object.
    static get_object(canvas, json) { }

    // Returns a deep clone of the tool.
    clone() {
        return Tool.get_object(this.canvas, JSON.parse(this.stringify()));
    }
}