import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Chatbot.css";

function Chatbot({ onLogout, username }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { user: "", bot: `Welcome to MyoMind, ${username}! How can I assist you today? 😊` },
  ]);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderData, setReminderData] = useState({
    type: "medicine",
    time: "",
  });

  const chatBoxRef = useRef(null);
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);
  

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = message;
    setMessage(""); // Clear input
    setChatHistory((prev) => [...prev, { user: userMsg, bot: "Typing..." }]);

    try {
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes("set reminder") || lowerMsg.includes("remind me")) {
        setShowReminderForm(true);
        setChatHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].bot = "Sure! Please fill in the reminder details below.";
          return [...updated];
        });
        return;
      }

      const isHospitalQuery = lowerMsg.includes("hospital");

      if (isHospitalQuery && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
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
          },
          () => {
            animateBotResponse("Location access denied. I can't find nearby hospitals without it.");
          }
        );
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
    }, 25);
  };

  const handleSubmitReminder = (e) => {
    e.preventDefault();
  
    const now = new Date();
    const [hour, minute] = reminderData.time.split(":").map(Number);
  
    const reminderTime = new Date();
    reminderTime.setHours(hour);
    reminderTime.setMinutes(minute);
    reminderTime.setSeconds(0);
  
    // If the selected time is in the past for today, set it for tomorrow
    if (reminderTime < now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
  
    const timeDifference = reminderTime.getTime() - now.getTime();
  
    // ✅ Schedule local notification
    setTimeout(() => {
      new Notification("⏰ Health Reminder", {
        body: `It's time for your ${reminderData.type}`,
      });
    }, timeDifference);
  
    // Confirm to user in chat
    const confirmationMsg = `✅ Reminder set for "${reminderData.type}" at ${reminderData.time}`;
    setChatHistory((prev) => [...prev, { user: "", bot: confirmationMsg }]);
  
    // Reset form
    setReminderData({ type: "medicine", time: "" });
    setShowReminderForm(false);
  };
  
  useEffect(() => {
    // Scroll to bottom when chat updates
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  // 🔔 Ask for notification permission (only once on component mount)
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        console.log("Permission:", permission);
      });
    }
  }, []);
  
  

  return (
    <div className="chatbot-container">
      
      
      <div className="chatbot-card">
        <div className="chat-box" ref={chatBoxRef}>
          {chatHistory.map((chat, index) => (
            <div key={index}>
              {chat.user && <div className="chat-message user-message">{chat.user}</div>}
              <div className="chat-message bot-message">
                <div dangerouslySetInnerHTML={{ __html: chat.bot.replace(/\n/g, "<br />") }} />
              </div>
            </div>
          ))}
        </div>

        {/* 📅 Health Reminder Form */}
        {showReminderForm && (
          <div className="reminder-form p-3">
            <h5>🕒 Set a Health Reminder</h5>
            <form onSubmit={handleSubmitReminder}>
              <div className="form-group mb-2">
                <label>Reminder Type</label>
                <select
                  className="form-control"
                  value={reminderData.type}
                  onChange={(e) => setReminderData({ ...reminderData, type: e.target.value })}
                >
                  <option value="medicine">Medicine</option>
                  <option value="appointment">Follow-up Appointment</option>
                  <option value="motivation">Daily Motivation</option>
                </select>
              </div>

              <div className="form-group mb-2">
                <label>Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={reminderData.time}
                  onChange={(e) => setReminderData({ ...reminderData, time: e.target.value })}
                  required
                />
              </div>

              <button className="btn btn-success mt-2" type="submit">
                Set Reminder
              </button>
            </form>
          </div>
        )}

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
