from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Example requiremnts
# 1. The system must allow users to log in with email and password.
# 2. The system must send email notifications for important events.
# 3. Users must be able to view their order history.
# 4. The system must have a password recovery option.
# 5. Users can customize their notification preferences.

load_dotenv()
api_key = os.getenv('API_KEY')

genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app) 

model = genai.GenerativeModel(model_name="gemini-1.5-flash")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({"error": "No query provided"}), 400

    prompt = str([
        "With the use of the following list of requirements, give a lista of user userstories.\n",
        "Give in a format like csv, where there is index, and the user story, both type string so wrapped in quotation marks.\n",
        "Don't add any more text execpt the csv format.\n",
        f"Here is the list of requirements:\n{query}."])
    response = model.generate_content(prompt)
    return jsonify({"response": response.text})

if __name__ == "__main__":
    app.run(port=5001, debug=True)