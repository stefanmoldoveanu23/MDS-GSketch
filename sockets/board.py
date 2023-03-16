from pymongo import ReturnDocument
from pymongo.errors import PyMongoError
from flask_socketio import Namespace, emit
from flask import current_app, flash, session
from bson.objectid import ObjectId


class BoardNamespace(Namespace):
    def on_connect(self):
        pass

    def on_disconnect(self):
        pass

    def on_update(self, json):
        emit('update', json, broadcast=True)

        board_id = session['board_id']
        boards = current_app.config.db.boards

        try:
            actions = boards.find_one({'_id': ObjectId(board_id)})['actions']
            actions.append(json)

            boards.update_one({
                '_id': ObjectId(board_id)
            }, {
                '$set': {
                    'actions': actions
                }
            }, upsert=False)
        except PyMongoError as e:
            print(str(e))
            flash("Database error")
            emit('database-error')
            return


    def on_init(self, board_width, board_height):
        print('Started init...')

        board_id = session['board_id']
        boards = current_app.config.db.boards

        try:
            board = boards.find_one_and_update({
                '_id': ObjectId(board_id)
            }, {
                '$set': {
                    'width': board_width,
                    'height': board_height,
                }
            }, upsert=False, return_document=ReturnDocument.AFTER)
            print('Done init.')

            board.pop('_id')
            emit('done_init', board)
        except PyMongoError as e:
            print(str(e))
            flash("Database error")
            emit('database-error')
