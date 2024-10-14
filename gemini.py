from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv('API_KEY')

genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app) 

model = genai.GenerativeModel(model_name="gemini-1.5-flash")

@app.route('/generate', methods=['POST'])
def generate_response():
    data = request.get_json()
    query = data.get('query')

    if not query:
        return jsonify({"error": "No query provided"}), 400

    response = model.generate_content(query)
    return jsonify({"response": response.text})

if __name__ == '__main__':
    app.run(debug=True)