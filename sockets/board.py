from flask_socketio import Namespace, emit, join_room
from flask import session, current_app
import json
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId


# Description of the client-server protocol:
# 1) The client creates a web socket and connects to the server.
# 2) The server receives the connection, and checks to see if the session contains board_id.
#     If the session does not contain board_id, reject the connection. Else, make the connecting
#     socket join a room based on the board_id.

# 3) The client is now connected. It can now emit the following events:
#    a) "get_data" : will request for the server to send the complete board data.
#    b) "update" : will send an update to the board to the server.
#    The client must also listen for the following events:
#    a) "update" : the server sends the client an update to the board. This happens when
#        any user modifies the board.
#    b) "data" : the server sends the client the board data, as a response to "get_data"

class BoardNamespace(Namespace):
    def on_connect(self):
        # Reject the session if it does not contain board_id.
        if "board_id" not in session:
            return False
        # If the session contains the board_id, make the socket join the room given by board_id.
        join_room(session["board_id"])

    def on_disconnect(self):
        pass

    # A client requested the board data.
    def on_get_data(self):
        # Get the board id from the session.
        # Note that the session must contain board_id, otherwise the socket would have been rejected.
        board_id = session["board_id"]

        # Get the "events" collection.
        events = current_app.config.db.events

        # Query the database for the changes associated with the current board.
        # Handle any database errors.
        try:
            # Exclude _id and board_id.
            changes = events.find({"board_id": ObjectId(board_id)}, {"_id": 0, "board_id": 0})
        except PyMongoError as e:
            print(str(e))
            return

        # Convert the data to json.
        json_data = json.dumps(list(changes))

        # Send the data to the user that has requested it.
        emit("data", json_data)

    # We receive an update from a user.
    def on_update(self, json_data):
        # Get the board id from the session.
        board_id = session["board_id"]

        # TODO Check if data is valid before storing it in the database.
        data = json.loads(json_data)

        # Add board_id to the record.
        data["board_id"] = ObjectId(board_id)

        # Get the "events" collection.
        events = current_app.config.db.events

        # Insert the update in the database.
        # Handle any database errors.
        try:
            events.insert_one(data)
        except PyMongoError as e:
            print(str(e))
            # Do not emit the change.
            return

        # TODO Fix race condition.
        # If the client handlers are handled in separate threads/processes,
        # there might be a situation where a client might get the order of changes wrong.
        # Consider the case where two clients make a change simultaneously (A and B).
        # Let's say that A's change gets inserted in the database before B's change.
        # Then, it can be possible that B's change is inserted into the database
        # and transmitted to the room before A's change gets transmitted. Therefore,
        # B got transmitted before A, but A was inserted before B in the database.
        # To avoid this, we can implement per room locks, so that per-room operations
        # are thread-safe.

        # Broadcast the update to all the connections in the room.
        emit('update', json_data, to=session["board_id"])
