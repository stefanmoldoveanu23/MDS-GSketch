from flask import render_template, Blueprint, redirect, url_for, g, current_app, flash
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from bson.json_util import dumps

board = Blueprint('board', __name__, url_prefix='/board')


@board.get("/<board_id>")
def show_board(board_id):
    print('Started showing...')
    boards = current_app.config.db.boards
    try:
        board_data = boards.find_one({"_id": ObjectId(board_id)})
    except PyMongoError as e:
        print(str(e))
        flash("Database error")
        return redirect(url_for("/"))

    g.board_data = dumps(board_data)
    print('Done showing.')
    return render_template("board.html")


@board.post("/")
def handle_create():
    boards = current_app.config.db.boards
    new_board = {"width": 0, "height": 0, "baseImage": "", "latestActions": []}

    try:
        new_board = boards.insert_one(new_board)
    except PyMongoError as e:
        print(str(e))
        flash("Database error")
        return redirect(url_for("/"))

    return redirect(url_for("board.show_board", board_id=new_board.inserted_id))
