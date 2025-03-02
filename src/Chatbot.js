import React, { useState } from "react";
import axios from "axios";

function Chatbot() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    try {
      const res = await axios.post("http://127.0.0.1:5000/chatbot", { message });
      setResponse(res.data.response);
    } catch (error) {
      setResponse("Error: Could not connect to backend.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>MyoMind Chatbot</h2>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
      <p><strong>Bot:</strong> {response || "Hello! How can I help you?"}</p>
    </div>
  );
}

export default Chatbot;
