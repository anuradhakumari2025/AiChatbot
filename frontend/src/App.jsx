import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import "./App.css";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isAITyping, setIsAITyping] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);

  const chatEndRef = useRef(null);

  // Helper to get current time in hh:mm format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Send message to AI
  const sendMessage = () => {
    if (message.trim() === "") return;

    setChatHistory((prev) => [
      ...prev,
      { sender: "me", text: message, time: getCurrentTime() },
    ]);

    socket.emit("ai-message", message);
    setMessage("");
    setIsUserTyping(false);
    setIsAITyping(true); // AI starts typing
  };

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAITyping, isUserTyping]);

  // Setup socket connection
  useEffect(() => {
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    socketInstance.on("ai-message-response", (data) => {
      setChatHistory((prev) => [
        ...prev,
        { sender: "other", text: data, time: getCurrentTime() },
      ]);
      setIsAITyping(false);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Anuk AI Chatbot</h1>
      </div>

      <div className="chat-box">
        {chatHistory.length === 0 && !isUserTyping && !isAITyping && (
          <p className="start-text">Start conversation...</p>
        )}

        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === "me" ? "me" : "other"}`}
          >
            <p>{msg.text}</p>
            <span className="time">{msg.time}</span>
          </div>
        ))}

        {isUserTyping && (
          <div className="typing-indicator me">Typing...</div>
        )}

        {isAITyping && (
          <div className="typing-indicator other">AI is typing...</div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setIsUserTyping(e.target.value.trim() !== "");
          }}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
