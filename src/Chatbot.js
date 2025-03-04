import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chatbot.css";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const newChat = { user: message, bot: "Typing..." };
    setChatHistory([...chatHistory, newChat]);

    try {
      const res = await axios.post("http://127.0.0.1:5000/chatbot", { message });
      setChatHistory([...chatHistory, { user: message, bot: res.data.reply }]);
    } catch (error) {
      setChatHistory([...chatHistory, { user: message, bot: "Error: Could not connect to the chatbot." }]);
    }

    setMessage("");
  };

  return (
    <div 
      className="chatbot-container d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: `url('/heart.jpg') no-repeat center center/cover`
      }}
    >
      <div className="card shadow-lg p-4 chatbot-card">
        <h2 className="text-center text-danger">💓 MyoMind Chatbot</h2>
        <div className="chat-box">
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <p className="user-message"><strong>You:</strong> {chat.user}</p>
              <p className="bot-message"><strong>Bot:</strong> {chat.bot}</p>
            </div>
          ))}
        </div>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <button className="btn btn-danger" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
