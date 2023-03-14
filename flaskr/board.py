from flask import render_template, Blueprint

board = Blueprint('board', __name__, url_prefix='/boardpage')


@board.get("/")
def show_boardpage():
    return render_template("boardpage.html")