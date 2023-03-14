from flask_socketio import Namespace, emit


class BoardNamespace(Namespace):
    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_line(self, p1, p2):
        emit('getline', (p1, p2), broadcast=True)
