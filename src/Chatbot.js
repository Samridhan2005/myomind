import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [chatHistory, setChatHistory] = useState([]); // Stores chat messages

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent empty messages

    const newChat = { user: message, bot: "I'm learning to respond.. i will be trained in few weeks" };
    setChatHistory([...chatHistory, newChat]); // Show "Typing..." effect

    try {
      const res = await axios.post("http://127.0.0.1:5000/chatbot", { message });

      // Update chat history with bot response
      setChatHistory([...chatHistory, { user: message, bot: res.data.response }]);
      setResponse(res.data.response);
    } catch (error) {
      setResponse("Error: Could not connect to backend.");
    }

    setMessage(""); // Clear input box after sending
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <div className="card shadow-lg p-4" style={{ width: "400px", borderRadius: "15px", background: "#f8f9fa" }}>
        <h2 className="text-center text-primary">💬 MyoMind Chatbot</h2>
        <div className="chat-box" style={{ height: "300px", overflowY: "auto", background: "#fff", padding: "10px", borderRadius: "10px", marginBottom: "10px" }}>
          {chatHistory.map((chat, index) => (
            <div key={index}>
              <p className="text-end text-primary"><strong>You:</strong> {chat.user}</p>
              <p className="text-start text-success"><strong>Bot:</strong> {chat.bot}</p>
            </div>
          ))}
        </div>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Ask any question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()} // Send message on Enter key
          />
          <button className="btn btn-primary" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
