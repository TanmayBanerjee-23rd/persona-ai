"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Menu,
  Plus,
  Trash2,
  X,
  Github,
  Terminal,
  Cpu,
  Settings,
  ChevronRight,
} from "lucide-react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Message, Role } from "../types";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [inputText]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userContent = inputText.trim();
    setInputText("");

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: userContent,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    const newAiMessageId = (Date.now() + 1).toString();
    const newAiMessage: Message = {
      id: newAiMessageId,
      role: Role.MODEL,
      content: "",
      timestamp: Date.now(),
      isStreaming: true,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userContent, history: messages }),
      });

      const { reply } = await res.json();

      setMessages((prev) => [
        ...prev,
        { ...newAiMessage, content: reply, isStreaming: false },
      ]);
    } catch (error) {
      console.error("Chat API Error ::", error);

      setMessages((prev) => [
        ...prev,
        {
          ...newAiMessage,
          content: "Sorry, something went wrong.",
          isStreaming: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-industrial-bg text-industrial-text font-sans">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0"></div>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Technical Sidebar */}
      <aside
        className={`
            fixed inset-y-0 left-0 z-50 w-72 bg-industrial-panel border-r border-industrial-border
            transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
            flex flex-col shadow-2xl
            ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-industrial-border bg-striped-pattern bg-[length:10px_10px]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-industrial-accent flex items-center justify-center text-black font-bold rounded-sm">
              <Terminal size={18} strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-tight text-white leading-none">
                PersonA <AutoAwesomeIcon className="animate-pulse" />
              </h1>
              <span className="text-[10px] text-industrial-accent font-mono">
                SYS.VER.1.0
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-industrial-subtext hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Actions */}
        <div className="p-4">
          <button
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-3 py-3 border border-industrial-border hover:border-industrial-accent bg-black/20 hover:bg-industrial-accent/10 transition-all group rounded-sm"
          >
            <Plus
              size={16}
              className="text-industrial-subtext group-hover:text-industrial-accent"
            />
            <span className="text-xs font-mono font-bold text-industrial-subtext group-hover:text-industrial-accent uppercase tracking-widest">
              Init Sequence
            </span>
          </button>
        </div>

        {/* Sidebar Content (Logs) */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          <div className="px-2 py-2 flex items-center gap-2 text-[10px] font-mono text-industrial-subtext uppercase border-b border-industrial-border/50 mb-2">
            <ChevronRight size={10} />
            <span>Operation Logs</span>
          </div>
          {/* Placeholder for history items */}
          <div className="group relative p-3 border-l-2 border-transparent hover:border-industrial-accent hover:bg-white/5 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-industrial-text">
                SESSION_ID_0492
              </span>
              <span className="text-[10px] text-industrial-subtext">14:02</span>
            </div>
            <div className="text-xs text-industrial-subtext truncate group-hover:text-gray-400">
              System check complete...
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-industrial-border bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-industrial-text uppercase">
                System Online
              </span>
            </div>
            <Settings
              size={16}
              className="ml-auto text-industrial-subtext hover:text-industrial-accent cursor-pointer"
            />
          </div>
        </div>
      </aside>

      {/* Main Interface */}
      <main className="flex-1 flex flex-col h-full relative z-10">
        {/* Top Navigation Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-industrial-border bg-industrial-bg/90 backdrop-blur-sm z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 text-industrial-subtext hover:text-white border border-transparent hover:border-industrial-border rounded-sm"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex items-center gap-6 text-xs font-mono text-industrial-subtext">
              <div className="flex items-center gap-2">
                <Cpu size={14} />
                <span>
                  CPU_LOAD: <span className="text-industrial-accent">14%</span>
                </span>
              </div>
              <span className=" text-xs font-mono">
                Latency: <span className="text-industrial-accent ">12ms</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-industrial-accent"></div>
            <span className="text-industrial-subtext text-xs">
              MODEL: GEMINI-2.5-FLASH
            </span>
          </div>
        </header>

        {/* Timeline Container */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-industrial-bg">
          {/* THE SPINE (Vertical Line) */}
          <div className="absolute top-0 bottom-0 left-[32px] md:left-1/2 w-[1px] bg-industrial-border z-0"></div>

          <div className="max-w-6xl mx-auto min-h-full px-4 md:px-8 py-8 flex flex-col relative z-10">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center animate-[fadeIn_0.8s_ease-out_forwards]">
                <div className="border border-industrial-border bg-industrial-panel p-10 max-w-lg w-full relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-industrial-accent"></div>
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-industrial-accent/5 rounded-full blur-3xl group-hover:bg-industrial-accent/10 transition-colors"></div>

                  <div className="flex items-center gap-4 mb-6">
                    <Terminal size={32} className="text-industrial-accent" />
                    <h2 className="text-2xl font-bold font-sans tracking-tight text-white">
                      PersonA <AutoAwesomeIcon className="animate-pulse" />
                    </h2>
                  </div>

                  <p className="font-mono text-sm text-industrial-subtext mb-8 leading-relaxed">
                    {"> SYSTEM INITIALIZED."}
                    <br />
                    {"> NEURAL LINK ESTABLISHED."}
                    <br />
                    {"> WAITING FOR USER INPUT..."}
                  </p>

                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Initialize React Project structure",
                      "Analyze current market trends",
                      "Debug: Python recursion error",
                      "Generate narrative sequence",
                    ].map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInputText(cmd);
                          if (textareaRef.current) textareaRef.current.focus();
                        }}
                        className="text-left px-4 py-3 border border-industrial-border bg-black/40 hover:border-industrial-accent hover:bg-industrial-accent/5 transition-all text-xs font-mono text-industrial-subtext hover:text-industrial-text flex items-center justify-between group/btn"
                      >
                        <span>{`> ${cmd}`}</span>
                        <span className="opacity-0 group-hover/btn:opacity-100 text-industrial-accent">
                          +
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    side={msg.role === Role.USER ? "left" : "right"}
                  />
                ))}

                {isLoading &&
                  messages[messages.length - 1]?.role !== Role.MODEL && (
                    <div className="w-full flex justify-start md:justify-center md:pl-8 relative mb-8">
                      {/* Connector for loading state (Right side on desktop, right side of left spine on mobile) */}
                      <div className="hidden md:block absolute left-1/2 top-6 w-8 h-[1px] bg-industrial-border"></div>
                      <div className="md:hidden absolute left-0 top-6 w-8 h-[1px] bg-industrial-border"></div>

                      <div className="md:ml-8 pl-8 md:pl-0">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                <div ref={messagesEndRef} className="h-8" />
              </>
            )}
          </div>
        </div>

        {/* Command Input Area */}
        <div className="border-t border-industrial-border bg-industrial-panel p-4 md:p-6 z-20 relative">
          <div className="max-w-4xl mx-auto">
            <div
              className={`
                  relative flex items-end gap-0 border-2 transition-all duration-300
                  ${isLoading ? "border-industrial-border opacity-50" : "border-industrial-border focus-within:border-industrial-accent bg-black"}
                `}
            >
              {/* Prompt Decorator */}
              <div className="hidden md:flex items-center h-full pl-3 py-3 text-industrial-accent font-mono font-bold select-none">
                <span>
                  root@personA
                  <AutoAwesomeIcon
                    fontSize="inherit"
                    className="animate-pulse"
                  />
                  :~#
                </span>
              </div>

              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter command or query..."
                rows={1}
                className="flex-1 bg-transparent text-industrial-text placeholder-industrial-subtext/50 font-mono text-sm p-3 focus:outline-none resize-none max-h-[200px] overflow-y-auto custom-scrollbar"
                style={{ minHeight: "48px" }}
              />

              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                className={`
                      p-3 m-1 border transition-all duration-200
                      ${
                        inputText.trim() && !isLoading
                          ? "bg-industrial-accent text-black border-industrial-accent hover:bg-yellow-400"
                          : "bg-transparent text-industrial-subtext border-transparent cursor-not-allowed"
                      }
                      `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="hidden md:inline font-mono text-xs font-bold uppercase">
                      EXEC
                    </span>
                    <Send size={16} />
                  </div>
                )}
              </button>

              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-1 h-1 bg-industrial-text"></div>
              <div className="absolute top-0 right-0 w-1 h-1 bg-industrial-text"></div>
              <div className="absolute bottom-0 left-0 w-1 h-1 bg-industrial-text"></div>
              <div className="absolute bottom-0 right-0 w-1 h-1 bg-industrial-text"></div>
            </div>

            <div className="flex justify-between mt-2 px-1">
              <p className="text-[10px] font-mono text-industrial-subtext">
                TOKEN_USAGE: OPTIMIZED
              </p>
              <button
                onClick={clearChat}
                className="flex items-center gap-1 text-[10px] font-mono text-industrial-subtext hover:text-red-500 transition-colors"
              >
                <Trash2 size={10} />
                FLUSH_MEMORY
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
