import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chatbot.css";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage("");

    setChatHistory((prev) => [...prev, { user: userMsg, bot: "Typing..." }]);

    try {
      const isHospitalQuery = userMsg.toLowerCase().includes("hospital");

      if (isHospitalQuery && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const payload = {
            queryResult: {
              intent: {
                displayName: "Find Nearby Hospitals"
              },
              parameters: {
                latitude: lat,
                longitude: lng
              }
            }
          };

          const res = await axios.post("http://127.0.0.1:5000/webhook", payload);

          setChatHistory((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].bot = res.data.fulfillmentText;
            return [...updated];
          });

        }, () => {
          setChatHistory((prev) => {
            const updated = [...prev];
            updated[updated.length - 1].bot = "Location access denied. I can't find nearby hospitals without it.";
            return [...updated];
          });
        });

      } else {
        const res = await axios.post("http://127.0.0.1:5000/chatbot", { message: userMsg });

        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].bot = res.data.reply;
          return [...updated];
        });
      }
    } catch (error) {
      setChatHistory((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = "Error: Could not connect to the chatbot.";
        return [...updated];
      });
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-card">
        <div className="chat-header">💓 MyoMind Chatbot</div>

        <div className="chat-box d-flex flex-column">
          {chatHistory.map((chat, index) => (
            <div key={index} className="message-group">
              <div className="chat-message user-bubble">
                {chat.user}
              </div>
              <div className="chat-message bot-bubble">
                {chat.bot.split("\n").map((line, i) => (
                  <span key={i}>{line}<br /></span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
