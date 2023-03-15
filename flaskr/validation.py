import re

# This module contains various functions to test the validity of forms.
username_regex = re.compile("^[a-zA-Z][a-zA-Z0-9-_]{7,24}$")


# Returns a message if the username is not valid, else None.
def check_username(username):
    if len(username) < 8 or len(username) > 25:
        return "The username must be between 8 and 25 characters."
    if not username_regex.match(username):
        return '''The username must begin with a letter and should contain only digits, underscore or dash characters.'''
    return None
