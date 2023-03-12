from flask import Flask
from flask import render_template
from . import database
from . import authentication


def create_app():
    # The configuration file will be found in the instance folder.
    app = Flask(__name__, instance_relative_config=True)

    # Load the configuration file.
    app.config.from_pyfile("config.py")

    # Configure the database.
    app.config.db = database.get_db(app.config["DATABASE_AUTH"])

    # Add the /authentication subpath.
    app.register_blueprint(authentication.authentication)

    # The main page.
    @app.get("/")
    def show_main():
        return render_template("index.html")

    return app
