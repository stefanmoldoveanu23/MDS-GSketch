from flask import render_template, Blueprint, redirect, url_for, current_app, flash, session, g
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId

board = Blueprint('board', __name__, url_prefix='/board')


@board.get("/")
def show_board():
    print('Started showing...')
    board_id = session["board_id"]
    boards = current_app.config.db.boards
    try:
        board_data = boards.find_one({'_id': ObjectId(board_id)})
        board_data.pop('_id')
        g.board_data = board_data
    except PyMongoError as e:
        print(str(e))
        flash("Database error")
        return redirect("/")

    print('Done showing.')
    return render_template("board.html")


@board.post("/")
def handle_create():
    boards = current_app.config.db.boards
    new_board = {"width": 0, "height": 0, "actions": []}

    try:
        new_board = boards.insert_one(new_board)
        session['board_id'] = str(new_board.inserted_id)

        return redirect(url_for("board.show_board"))
    except PyMongoError as e:
        print(str(e))
        flash("Database error")
        return redirect("/")

