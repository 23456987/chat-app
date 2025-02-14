import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./App.css";

const socket = io("http://localhost:8080");

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState("");
    const [darkMode, setDarkMode] = useState(false); // 🌙 Dark Mode State

    useEffect(() => {
      axios.get("http://localhost:8080/api/chat")
          .then((res) => setMessages(res.data))
          .catch((err) => console.error("Error fetching messages:", err));
  
      const handleMessage = (newMessage) => {
          setMessages((prev) => [...prev, newMessage]);
      };
  
      socket.on("receiveMessage", handleMessage);
  
      return () => {
          socket.off("receiveMessage", handleMessage); // 🔴 Prevent duplicate listeners
      };
  }, []);
  
  const sendMessage = () => {
    if (message.trim()) {
        const newMessage = {
            username,
            message,
            time: new Date().toLocaleTimeString(),
        };

        socket.emit("sendMessage", newMessage);
        setMessage(""); // ✅ Only clear input (don't add message manually)
    }
};

    return (
        <div className={`chat-container ${darkMode ? "dark-mode" : ""}`}>
            <header className="chat-header">
                <h2>Modern Chat</h2>
                <button className="toggle-mode" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
                </button>
            </header>

            {!username ? (
                <div className="username-input">
                    <input 
                        type="text" 
                        placeholder="Enter your username" 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                    <button onClick={() => username && setUsername(username)}>Join Chat</button>
                </div>
            ) : (
                <>
                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-container ${msg.username === username ? "sent" : "received"}`}>
                                <div className="message-avatar">{msg.username.charAt(0).toUpperCase()}</div>
                                <div className="message-bubble">
                                    <span className="message-user">{msg.username}</span>
                                    <p>{msg.message}</p>
                                    <span className="message-time">{msg.time}</span> {/* 🕒 Timestamp */}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="chat-input">
                        <input 
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                        />
                        <button onClick={sendMessage}>➤</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
