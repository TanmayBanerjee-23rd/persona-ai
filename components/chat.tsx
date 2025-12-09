"use client";

import { useState } from "react";
import MarkdownMessage from "./markdownMessage";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const chatContainer = document.getElementById("chatContainer");

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    console.log("chatContainer scrollHeight:", chatContainer?.scrollHeight);
    setLoading(true);
    setTimeout(() => {
      chatContainer?.scroll({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
      setInput("");
    }, 50);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history: messages }),
      });
      const { reply } = await res.json();
      const assistantMessage: Message = { role: "assistant", content: reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatContainer?.scroll({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
        setInput("");
      }, 50);
    }
  };

  return (
    <div className="chat-wrapper">
      <div id="chatContainer" className="w-full chat-container">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`message ${
              msg.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            <strong>{msg.role === "user" ? "You:" : "Persona:"}</strong>{" "}
            <div className="mt-1">
              {msg.role === "assistant" ? (
                <MarkdownMessage content={msg.content} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant-message">Thinking...</div>
        )}
      </div>
      <div className="message-input-container">
        <textarea
          name="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="w-full p-2 message-input mb-2"
          placeholder="Frame your thoughts..."
          cols={40}
          rows={5}
        />
        <SendRoundedIcon
          onClick={sendMessage}
          className="w-full message-input-icon"
        />
      </div>
    </div>
  );
}
