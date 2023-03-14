from flask import render_template, Blueprint

board = Blueprint('board', __name__, url_prefix='/board')


@board.get("/")
def show_boardpage():
    return render_template("board.html")