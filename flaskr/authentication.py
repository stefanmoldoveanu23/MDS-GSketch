from pymongo.errors import PyMongoError
from flask import Blueprint, render_template, current_app, flash, request, redirect, url_for, session, g
from bson.objectid import ObjectId
from werkzeug.security import check_password_hash, generate_password_hash

# This module handles user authentication.
authentication = Blueprint('authentication', __name__, url_prefix='/authentication')


# The register page.
@authentication.get('/register')
def show_register():
    return render_template("authentication/register.html")


# Post request to /register.
@authentication.post('/register')
def handle_register():
    # Check if the request form is valid.
    required = ["username", "email", "password", "confirm-password"]
    for param in required:
        if param not in request.form:
            flash("Invalid request.")
            return redirect(url_for("authentication.show_register"))

    # Extract arguments from the request form.
    username = request.form["username"]
    email = request.form["email"]
    password = request.form["password"]
    confirm_password = request.form["confirm-password"]

    # Check if the passwords match.
    if password != confirm_password:
        flash("The passwords do not match.")
        return redirect(url_for("authentication.show_register"))

    # Get the "users" collection.
    users = current_app.config.db.users

    # Query the database to check if the username/email are already used.
    # Handle any database errors that may occur.
    try:

        # Check if the username is already used.
        if users.find_one({"username": username}) is not None:
            flash("That username is taken.")
            return redirect(url_for("authentication.show_register"))

        # Check if the email is already used.
        if users.find_one({"email": email}) is not None:
            flash("That email address is taken.")
            return redirect(url_for("authentication.show_register"))

    except PyMongoError as e:
        print(str(e))
        flash("Database error.")
        return redirect(url_for("authentication.show_register"))

    # Hash the user password.
    password_hash = generate_password_hash(password)

    # Create the record that will be added to the "users" collection.
    new_user = {"username": username, "email": email, "password_hash": password_hash}

    # Insert the record into the "users" collection.
    # Handle any database errors that may occur.
    try:
        users.insert_one(new_user)
    except PyMongoError as e:
        print(str(e))
        flash("Database error.")
        return redirect(url_for("authentication.show_register"))

    return redirect(url_for("show_main"))


@authentication.get('/login')
def show_login():
    return render_template("authentication/login.html")


@authentication.post('/login')
def handle_login():
    # Check if the request form is valid.
    required = ["email", "password"]
    for param in required:
        if param not in request.form:
            flash("Invalid request.")
            return redirect(url_for("authentication.show_login"))

    # Extract arguments from the request form.
    email = request.form["email"]
    password = request.form["password"]

    # Get the "users" collection.
    users = current_app.config.db.users

    # Query the database for the user with the given email.
    # Handle any database errors that may occur.
    try:
        find_user = users.find_one({"email": email})
    except PyMongoError as e:
        print(str(e))
        flash("Database error.")
        return redirect(url_for("authentication.show_login"))

    # If no user was found, show an error.
    if find_user is None:
        flash("No user with that address.")
        return redirect(url_for("authentication.show_login"))

    # If the password is not correct, show an error.
    if not check_password_hash(find_user["password_hash"], password):
        flash("Incorrect password.")
        return redirect(url_for("authentication.show_login"))

    # Store user_id into the session.
    session["user_id"] = str(find_user["_id"])

    return redirect(url_for("show_main"))


# Before each application request, load the current user into the g variable.
# The g variable is a global variable that is shared between functions
# within one request. We can use the g variable in templates.
@authentication.before_app_request
def load_user():
    # If we are serving a static file, do not query the database.
    if request.endpoint == 'static':
        return

    # If the user_id is not in session, return.
    if "user_id" not in session:
        return

    # Extract the user id from session.
    user_id = session["user_id"]

    # Get the "users" collection.
    users = current_app.config.db.users

    # Load the user object, and handle any database errors.
    try:
        g.user = users.find_one({"_id": ObjectId(user_id)})
    except PyMongoError as e:
        print(e)
