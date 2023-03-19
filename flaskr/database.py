import pymongo


# This module contains tools used to interact with the mongo database.

# Create a new mongo client and use the auth_string to connect to the database.
def get_db(auth_string):
    client = pymongo.MongoClient(auth_string)
    return client.gsketch
