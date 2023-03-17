from flask import render_template, Blueprint, redirect, g, url_for, current_app, flash
from pymongo.errors import PyMongoError

board = Blueprint('board', __name__, url_prefix='/board')


@board.get("/")
def show_board():
    return render_template("board.html")


# A post request to /board/create will create a new board.
# Only authenticated users can create new boards.
@board.post("/create")
def create_board():
    # First check if the current session has a valid user.
    if g.user is None:
        # Redirect to the register page.
        return redirect(url_for("authentication.show_login"))

    # Then create a record that holds the board information.

    # The board record will hold a reference to the user that created it.
    # In the future, we may add more useful attributes to the board record.
    new_board = {"user_id": g.user["_id"]}

    # We get a reference to the "boards" collection.
    boards = current_app.config.db.boards

    # Insert the record into the "boards" collection. Handle any database errors.
    try:
        boards.insert_one(new_board)
    except PyMongoError as e:
        print(str(e))
        flash("Database error")
        return redirect(url_for("show_main"))

    return redirect(url_for("show_main"))
