from pymongo.errors import PyMongoError
from flask_socketio import Namespace, emit
from flask import current_app, flash
from bson.objectid import ObjectId


class BoardNamespace(Namespace):
    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_update(self, board_id, json):
        boards = current_app.config.db.boards

        try:
            latestActions = boards.find_one({'_id': ObjectId(board_id)})['latestActions']
            latestActions.append(json)

            boards.update_one({
                '_id': ObjectId(board_id)
            }, {
                '$set': {
                    'latestActions': latestActions
                }
            }, upsert=False)
        except PyMongoError as e:
            print(str(e))
            flash("Database error")
            emit('database-error')

        emit('update', json, broadcast=True)

    def on_init(self, board_id, board_width, board_height):
        print('Started init...')
        boards = current_app.config.db.boards

        try:
            boards.update_one({
                '_id': ObjectId(board_id)
            }, {
                '$set': {
                    'width': board_width,
                    'height': board_height,
                    'baseImage': chr(255) * int(board_width * board_height * 4)
                }
            }, upsert=False)
            print('Done init.')
        except PyMongoError as e:
            print(str(e))
            flash("Database error")
            emit('database-error')
