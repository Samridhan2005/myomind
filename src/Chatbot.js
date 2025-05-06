import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chatbot.css";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const chatBoxRef = useRef(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage(""); // Clear input

    // Add user message and temporary "Typing..." for bot
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
          animateBotResponse(res.data.fulfillmentText);

        }, () => {
          animateBotResponse("Location access denied. I can't find nearby hospitals without it.");
        });

      } else {
        const res = await axios.post("http://127.0.0.1:5000/chatbot", { message: userMsg });
        animateBotResponse(res.data.reply);
      }

    } catch (error) {
      animateBotResponse("Error: Could not connect to the chatbot.");
    }
  };

  const animateBotResponse = (response) => {
    let i = 0;
    const interval = setInterval(() => {
      if (i <= response.length) {
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].bot = response.slice(0, i);
          return updated;
        });
        i++;
      } else {
        clearInterval(interval);
      }
    }, 25); // Speed of typing
  };

  useEffect(() => {
    // Scroll to bottom when chat updates
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chatbot-container">
      <div className="chatbot-card">
        <div className="chat-header">💓 MyoMind Chatbot</div>

        <div className="chat-box" ref={chatBoxRef}>
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <div className="chat-message user-message">{chat.user}</div>
              <div className="chat-message bot-message">
              <div dangerouslySetInnerHTML={{ __html: chat.bot.replace(/\n/g, "<br />") }} />

              </div>
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            type="text"
            className="form-control"
            placeholder="Ask any question..."
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
