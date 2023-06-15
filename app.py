import flaskr
from sockets.board import BoardNamespace
from flask_socketio import SocketIO

app = flaskr.create_app()
socketio = SocketIO(app)

socketio.on_namespace(BoardNamespace("/board"))

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", log_output=True)
