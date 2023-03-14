import flaskr
from sockets.board import BoardNamespace
from flask_socketio import SocketIO

app = flaskr.create_app()
socketio = SocketIO(app)

socketio.on_namespace(BoardNamespace("/board"))

@socketio.on('x')
def func(a, b):
    print(a, b)

if __name__ == "__main__":
    socketio.run(app, allow_unsafe_werkzeug=True, debug=True, log_output=True)
