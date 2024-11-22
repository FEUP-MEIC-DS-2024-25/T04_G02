from flask import Flask, render_template
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import google.generativeai as genai
import os
from dotenv import load_dotenv
from db import db
from gemini import *
from api import *

# Example requiremnts
# 1. The system must allow users to log in with email and password.
# 2. The system must send email notifications for important events.
# 3. Users must be able to view their order history.
# 4. The system must have a password recovery option.
# 5. Users can customize their notification preferences.

load_dotenv()
api_key = os.getenv("API_KEY")

genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app, resources={r".*": {"origins": "*"}})

#model = genai.GenerativeModel(model_name="gemini-1.5-flash")

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_DATABASE = os.getenv("DB_DATABASE")
DB_USER = os.getenv("DB_USERNAME")
DB_PASSWORD = os.getenv("DB_PASSWORD")

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_DATABASE}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.register_blueprint(blueprint=blueprint)

app.register_blueprint(api)

# db = SQLAlchemy(app)
db.init_app(app)


@app.route("/")
def home():
    return render_template("index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
