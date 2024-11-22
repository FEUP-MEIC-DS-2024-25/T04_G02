from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from models import *
from database import *
import json
import random
import string

model = genai.GenerativeModel(model_name="gemini-1.5-flash")


# Example requiremnts
# 1. The system must allow users to log in with email and password.
# 2. The system must send email notifications for important events.
# 3. Users must be able to view their order history.
# 4. The system must have a password recovery option.
# 5. Users can customize their notification preferences.

load_dotenv()
api_key = os.getenv("API_KEY")

genai.configure(api_key=api_key)

blueprint = Blueprint("gemini_api", __name__)

@blueprint.route("/generate", methods=["POST"])
def generate_response():
    data = request.get_json()
    query = data.get("query")
    
    numero_aleatorio = random.randint(0, 100)
    project_name = f"teste{numero_aleatorio}"

    project_id = save_project(project_name)

    requirements_id = save_requirement(project_id, query)

    #if not query:
    #    return jsonify({"error": "No query provided"}), 400

    #prompt = str(
    #    [
    #        "With the use of the following requirements, give a list of userstories and a list of possible acceptance criteria for each user story.\n",
    #        "The userstories have the format: As a [...], I want [...], so that [...]\n",
    #        "Each acceptance test inside the acceptance criteria have the given/when/then format\n"
    #        'Give in a JSON format, where there is "index" and the "user_story" are type string so wrapped in quotation marks, and the "acceptance_criteria" a list of acceptance tests, all of type string so wrapped in quotation marks within a JSON list.\n',
    #        "The result must be only a JSON list, no more information.\n",
    #        "Don't add any more text or newlines to the JSON, without ```json```.\n",
    #        f"Here is the requirements:\n{query}.",
    #    ]
    #)

    #response = model.generate_content(prompt)
    #result = response.replace("```json", "").replace("```", "")

    result = """[{"index": 1, 
              "user_story": "test",
              "acceptance_criteria":["oi"]}]"""
    
    save_user_stories(result, requirements_id)

    return jsonify({"response": result}), 200

def save_user_stories(response, req_id):
    data = json.loads(response)

    for item in data:
       save_user_story(item['index'], item['user_story'], req_id)

