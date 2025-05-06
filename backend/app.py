import requests

from flask import Flask, request, jsonify
from flask_cors import CORS
import google.cloud.dialogflow_v2 as dialogflow
import os
import google.generativeai as genai
import math
import requests
from flask import jsonify
from geopy.distance import geodesic

# Set up Gemini AI API Key
genai.configure(api_key="AIzaSyCFxfJJHetG8Y16o91vhXf9KrapnIjeZUE")

app = Flask(__name__)
CORS(app)  # Allow frontend to access backend

def get_gemini_response(user_message):
    """Send user message to Gemini AI and get a response."""
    model = genai.GenerativeModel("gemini-pro")  # Using the Gemini Pro model
    response = model.generate_content(user_message)
    
    if response and response.candidates:
        return response.candidates[0].content.parts[0].text
    else:
        return "I'm sorry, I couldn't generate a response. Please try again."

@app.route("/chat_with_gemini", methods=["POST"])
def chat_with_gemini():
    """Handles user messages and returns responses from Gemini AI."""
    data = request.json
    user_message = data.get("message")

    if not user_message:
        return jsonify({"response": "Please provide a message."}), 400

    bot_response = get_gemini_response(user_message)
    return jsonify({"response": bot_response})



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
@app.route("/webhook", methods=["POST"])
def dialogflow_webhook():
    req = request.get_json()
    intent = req.get("queryResult", {}).get("intent", {}).get("displayName", "")

    if intent == "Find Nearby Hospitals":
        return handle_hospital_search(req)

    return jsonify({"fulfillmentText": "Sorry, I don't know how to handle that intent."})

def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in kilometers
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

    return R * c  # Distance in km

def handle_hospital_search(req):
    parameters = req.get("queryResult", {}).get("parameters", {})
    lat = parameters.get("latitude")
    lng = parameters.get("longitude")

    if not lat or not lng:
        return jsonify({"fulfillmentText": "Could you please share your location so I can find nearby hospitals?"})

    overpass_url = "https://overpass-api.de/api/interpreter"
    query = f"""
    [out:json];
    (
      node["amenity"="hospital"](around:10000,{lat},{lng});
      way["amenity"="hospital"](around:10000,{lat},{lng});
      relation["amenity"="hospital"](around:10000,{lat},{lng});
    );
    out center;
    """

    response = requests.post(overpass_url, data={"data": query})
    if response.status_code != 200:
        return jsonify({"fulfillmentText": "Sorry, I couldn't connect to the hospital data service."})

    data = response.json()
    elements = data.get("elements", [])

    if not elements:
        return jsonify({"fulfillmentText": "I couldn't find any hospitals near your location."})

    user_location = (float(lat), float(lng))
    hospital_list = []

    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "Unnamed Hospital")
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")

        if lat and lon:
            hospital_location = (lat, lon)
            distance = geodesic(user_location, hospital_location).km
            link = f"https://www.google.com/maps/search/?api=1&query={lat},{lon}"
            hospital_list.append((name, distance, link))

    # Sort by distance and take top 10
    hospital_list.sort(key=lambda x: x[1])
    top_hospitals = hospital_list[:10]

    reply_lines = [f"{i+1}. <a href='{link}' target='_blank'>{name}</a> - {dist:.2f} km away"
                   for i, (name, dist, link) in enumerate(top_hospitals)]

    reply = "These are the hospitals near you , click to view in map:\n" + "\n".join(reply_lines)
    return jsonify({
        "fulfillmentText": reply
    })

if __name__ == "__main__":
    app.run(debug=True)
