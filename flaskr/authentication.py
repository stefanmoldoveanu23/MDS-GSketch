import pymongo.errors

from flask import Blueprint, render_template, current_app, flash, request, redirect, url_for
from werkzeug.security import check_password_hash, generate_password_hash

# This modules handles user authentication.
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

    except pymongo.errors.PyMongoError as e:
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
    except pymongo.errors.PyMongoError as e:
        print(str(e))
        flash("Database error.")
        return redirect(url_for("authentication.show_register"))

    return redirect(url_for("show_main"))
