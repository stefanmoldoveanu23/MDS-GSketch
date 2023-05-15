from flask_socketio import Namespace, emit, join_room
from flask import session, current_app
import json
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from sockets.room import Room

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


# A dictionary of rooms, where the key is the board_id and the value is the room object.
rooms = {}


class BoardNamespace(Namespace):
    def on_connect(self):
        # Reject the session if it does not contain board_id.
        if "board_id" not in session:
            return False

        board_id = session["board_id"]

        # If the session contains the board_id, make the socket join the room given by board_id.
        join_room(board_id)

        # Add a new room to the dictionary of rooms if it does not exist already.
        if board_id not in rooms:
            rooms[board_id] = Room(board_id)

        # Increment the number of users in the room.
        rooms[board_id].num_users += 1

    def on_disconnect(self):
        board_id = session["board_id"]

        # Decrement the number of users.
        rooms[board_id].num_users -= 1

        # Remove the room from the dictionary if it is empty.
        if rooms[board_id].num_users == 0:
            rooms.pop(board_id)

    # A client requested the board data.
    def on_get_data(self):
        # Get the board id from the session.
        # Note that the session must contain board_id, otherwise the socket would have been rejected.
        board_id = session["board_id"]

        # Get the changes from the corresponding room.
        # Handle any database errors.
        try:
            json_data = rooms[board_id].get_all_changes()
        except PyMongoError as e:
            print(str(e))
            return

        # Send the data to the user that has requested it.
        emit("data", json_data)

    # We receive an update from a user.
    def on_update(self, json_data):
        # Get the board id from the session.
        board_id = session["board_id"]

        # TODO Check if data is valid before storing it in the database.
        data = json.loads(json_data)

        rooms[board_id].mutex.acquire()

        # Broadcast the update to all the connections in the room.
        emit('update', json_data, to=session["board_id"])

        # Update the corresponding room. Handle any database errors.
        try:
            rooms[board_id].update(data)
        except PyMongoError as e:
            print(str(e))
            return

        rooms[board_id].mutex.release()
