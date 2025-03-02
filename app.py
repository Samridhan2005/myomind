from flask import Flask, request, jsonify
from flask_cors import CORS  # Allows React to access Flask

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

@app.route("/")
def home():
    return "Flask Backend is Running!"

@app.route("/chatbot", methods=["POST"])
def chatbot():
    user_message = request.json.get("message")
    
    # Simulated chatbot logic (Replace this with Dialogflow later)
    if "hello" in user_message.lower():
        bot_response = "Hello! How can I assist you today?"
    elif "heart attack" in user_message.lower():
        bot_response = "If you suspect a heart attack, seek emergency help immediately!"
    else:
        bot_response = "I'm still learning! Can you try rephrasing your question?"
    
    return jsonify({"response": bot_response})

if __name__ == "__main__":
    app.run(debug=True)
