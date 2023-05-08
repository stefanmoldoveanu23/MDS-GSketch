import threading
from flask import current_app
from bson.objectid import ObjectId
import json


# This class is used to represent a room of users. It
# contains data local to that room and also synchronization
# primitives.
class Room:
    def __init__(self, board_id):
        # This mutex is used to synchronize operations relative to this room.
        self.mutex = threading.Lock()
        # The id of the board this room is for.
        self.board_id = board_id
        # The number of users in the room.
        self.num_users = 0

    # This method queries the database for all the changes since the creation of the board and
    # returns a json of the data.
    def get_all_changes(self):
        # Get the "events" collection.
        events = current_app.config.db.events

        # Exclude _id and board_id.
        changes = events.find({"board_id": ObjectId(self.board_id)}, {"_id": 0, "board_id": 0})

        # Convert the data to json.
        json_data = json.dumps(list(changes))
        return json_data

    # Update the board with the new change.
    def update(self, change):
        change["board_id"] = ObjectId(self.board_id)

        # Get the "events" collection.
        events = current_app.config.db.events

        # Insert the update in the database.
        events.insert_one(change)
