from flask_socketio import Namespace, emit


class BoardNamespace(Namespace):
    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_update(self, json):
        emit('update', json, broadcast=True)
