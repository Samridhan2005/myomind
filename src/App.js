import React, { useState } from "react";
import Chatbot from "./Chatbot";
import Register from "./Register";
import Login from "./Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState("");

  const handleRegisterSuccess = () => setShowRegister(false);
  const handleLoginSuccess = (name) => {
    setUsername(name);
    setIsLoggedIn(true);
  };
  const handleLogout = () => setIsLoggedIn(false);

  if (isLoggedIn) {
    return <Chatbot onLogout={handleLogout} username={username} />;
  }

  return showRegister ? (
    <Register onRegisterSuccess={handleRegisterSuccess} />
  ) : (
    <Login onLoginSuccess={(name) => handleLoginSuccess(name)} onSwitchToRegister={() => setShowRegister(true)} />
  );
}

export default App;
