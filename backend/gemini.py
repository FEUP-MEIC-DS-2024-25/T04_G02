from flask import Blueprint, request, jsonify
import google.generativeai as genai
import os
from dotenv import load_dotenv
from database import *

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
    project_name = data.get("name")
    query = data.get("query")
    
    project_info = save_project(project_name)

    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    requirements_id = save_requirement(project_info, query, True)

    prompt = str(
        [
            "With the use of the following requirements, give a list of userstories and a list of possible acceptance criteria for each user story.\n",
            "The userstories have the format: As a [...], I want [...], so that [...]\n",
            'Give in a JSON format, where there is "index" and the "user_story" are type string so wrapped in quotation marks.\n',
            "Only return a valid JSON list as a response. Do not include text outside of JSON format.\n",
            "Don't add any more text or newlines to the JSON, without ```json```.\n",
            f"Here is the requirements:\n{query}.",
        ]
    )
    response = model.generate_content(prompt)
    result = response.text.replace("```json", "").replace("```", "")


    save_user_stories(project_info[0], requirements_id, result)

    content = {
        "project_id" : project_info[0],
        "user_stories" : result
    }

    return jsonify({"response": content}), 200


@blueprint.route("/regenerate", methods=["POST"])
def regenerate_response():
    data = request.get_json()
    project_name = data.get("name")
    query = data.get("query")
    
    project_info = save_project(project_name)

    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    requirements_id = save_requirement(project_info, query, True)

    prompt = str(
        [
            "With the use of the following requirements, give a list of userstories and a list of possible acceptance criteria for each user story.\n",
            "The userstories have the format: As a [...], I want [...], so that [...]\n",
            'Give in a JSON format, where there is "index" and the "user_story" are type string so wrapped in quotation marks.\n',
            "Only return a valid JSON list as a response. Do not include text outside of JSON format.\n",
            "Don't add any more text or newlines to the JSON, without ```json```.\n",
            f"Here is the requirements:\n{query}.",
        ]
    )
    response = model.generate_content(prompt)
    result = response.text.replace("```json", "").replace("```", "")


    save_user_stories(project_info[0], requirements_id, result)

    content = {
        "project_id" : project_info[0],
        "user_stories" : result
    }

    return jsonify({"response": content}), 200