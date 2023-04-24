from flask import render_template, Blueprint, redirect, g, url_for, current_app, flash, session, request
from bson.objectid import ObjectId
from pymongo.errors import PyMongoError
from bson.errors import *

board = Blueprint('board', __name__, url_prefix='/board')


# A post request to /board/join will set the board_id parameter of the current session
# to the board_id of the board the user wants to join.
@board.post("/join/")
def join_board():
    # Extract the board_id from the request.
    if "board_id" not in request.form:
        flash("Invalid request")
        return redirect(url_for("show_main"))

    board_id = request.form["board_id"]

    # Try to convert the board id to a valid bson ObjectId, and handle any errors.
    try:
        obj_id = ObjectId(board_id)
    except BSONError:
        flash("The board id is not valid.")
        return redirect(url_for("show_main"))

    # Check if board_id exists.
    # We get a reference to the "boards" collection.
    boards = current_app.config.db.boards

    # Find the board by id. Handle any database errors.
    try:
        find_board = boards.find_one({"_id": obj_id})
    except PyMongoError as e:
        print(str(e))
        flash("Database error.")
        return redirect(url_for("show_main"))

    # If the board does not exist, redirect to the main page and signal an error.
    if find_board is None:
        flash("That board does not exist!")
        return redirect(url_for("show_main"))

    # Set the session's board_id.
    session["board_id"] = board_id

    # Show the board page.
    return render_template("board.html", pin=board_id)


# A post request to /board/create will create a new board and then associate
# the board id to the current session. It will then redirect to the board page.
# Only authenticated users can create new boards.
@board.post("/create")
def create_board():
    # First check if the current session has an authenticated user.
    if g.user is None:
        # Redirect to the login page.
        return redirect(url_for("authentication.show_login"))

    # Then create a record that holds the board information.

    # The board record will hold a reference to the user that created it.
    # In the future, we may add more useful attributes to the board record.
    new_board = {"user_id": g.user["_id"]}

    # We get a reference to the "boards" collection.
    boards = current_app.config.db.boards

    # Insert the record into the "boards" collection. Handle any database errors.
    try:
        # Get the id of the newly inserted record.
        board_id = boards.insert_one(new_board).inserted_id
    except PyMongoError as e:
        print(str(e))
        flash("Database error")
        return redirect(url_for("show_main"))

    # Set the board_id in the session variable.
    session["board_id"] = str(board_id)

    # Show the board page.
    return render_template("board.html", pin=board_id)
