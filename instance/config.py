import os

SECRET_KEY = os.getenv("SECRET_KEY")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_AUTH = f"mongodb+srv://alexvisan901:{DATABASE_PASSWORD}@gsketch.ijem27r.mongodb.net/?retryWrites=true&w=majority"
