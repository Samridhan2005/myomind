from flask import Flask, request, jsonify
from flask_cors import CORS
import google.cloud.dialogflow_v2 as dialogflow
import os

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

# Set up Dialogflow authentication
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r"C:\Users\ASWIN KUMAR\myomind-ui\backend\dialogflow-key.json"

def detect_intent(text, session_id="12345"):
    """Send user input to Dialogflow and return the response."""
    session_client = dialogflow.SessionsClient()
    session = session_client.session_path("myomindchatbot-shd9", session_id)

    text_input = dialogflow.TextInput(text=text, language_code="en")
    query_input = dialogflow.QueryInput(text=text_input)

    response = session_client.detect_intent(session=session, query_input=query_input)
    return response.query_result.fulfillment_text  # Return Dialogflow response

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"reply": "I didn't understand that."})

    bot_reply = detect_intent(user_message)
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)
