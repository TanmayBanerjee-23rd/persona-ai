import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message, Role } from "../types";
import { Copy, Check } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  side?: "left" | "right"; // Determines placement relative to spine
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  side = "right",
}) => {
  const isUser = message.role === Role.USER;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Styles based on side
  const alignmentClass = side === "left" ? "md:items-end" : "md:items-start";
  const textAlignment = side === "left" ? "md:text-left" : "text-left"; // User text inside the bubble is usually left aligned anyway for readability
  const containerAlignment = side === "left" ? "md:pr-8" : "md:pl-8";

  // Animation direction
  const animationClass =
    side === "left" ? "animate-slide-in-left" : "animate-slide-in-right";

  return (
    <div
      className={`relative flex flex-col w-full mb-8 ${alignmentClass} ${animationClass}`}
    >
      {/* Connector Line (Desktop) */}
      <div
        className={`hidden md:block absolute top-6 h-[1px] bg-industrial-border w-8
        ${side === "left" ? "right-0" : "left-0"}`}
      />

      {/* Connector Node (Desktop) */}
      <div
        className={`hidden md:block absolute top-[21px] w-2 h-2 rounded-full border border-industrial-accent bg-black z-10
        ${side === "left" ? "-right-1" : "-left-1"}
        ${isUser ? "bg-industrial-accent" : "bg-black"}
      `}
      />

      {/* Message Card */}
      <div
        className={`
        relative group max-w-full md:max-w-[85%] min-w-[300px] flex flex-col
        ${containerAlignment} pl-8 md:pl-0
        /* Mobile: always add left padding for spine */
      `}
      >
        {/* Mobile Connector (Always left) */}
        <div className="md:hidden absolute top-6 left-0 w-8 h-[1px] bg-industrial-border" />
        <div
          className={`md:hidden absolute top-[21px] -left-1 w-2 h-2 rounded-full border border-industrial-accent z-10 ${isUser ? "bg-industrial-accent" : "bg-black"}`}
        />

        {/* Card Header */}
        <div
          className={`
          flex items-center gap-2 mb-1 text-xs font-mono uppercase tracking-wider
          ${side === "left" ? "md:flex-row-reverse" : "flex-row"}
        `}
        >
          <span
            className={`px-1.5 py-0.5 rounded-sm ${isUser ? "bg-industrial-accent text-black font-bold" : "bg-industrial-border text-industrial-subtext"}`}
          >
            {isUser ? "USR_INPUT" : "SYS_OUTPUT"}
          </span>
          <span className="text-industrial-subtext">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>

        {/* Card Body */}
        <div
          className={`
          relative border border-industrial-border bg-industrial-panel p-5
          hover:border-industrial-accent/50 transition-colors duration-300
          ${side === "left" ? "rounded-tr-none" : "rounded-tl-none"}
          rounded-sm
        `}
        >
          {/* Tech decoration corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-industrial-border group-hover:border-industrial-accent transition-colors"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-industrial-border group-hover:border-industrial-accent transition-colors"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-industrial-border group-hover:border-industrial-accent transition-colors"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-industrial-border group-hover:border-industrial-accent transition-colors"></div>

          {isUser ? (
            <div className="font-sans text-industrial-text whitespace-pre-wrap text-base md:text-lg">
              {message.content}
            </div>
          ) : (
            <div className="font-sans text-industrial-text markdown-body">
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "text";
                    const isInline = !match;

                    if (isInline) {
                      return (
                        <code
                          className="bg-industrial-border/50 px-1.5 py-0.5 rounded-sm text-industrial-accent font-mono text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    const codeKey = `code-${language}-${Date.now()}`;

                    return (
                      <div
                        key={codeKey}
                        className="my-4 border border-industrial-border bg-black/50"
                      >
                        <div className="flex justify-between items-center px-3 py-1.5 border-b border-industrial-border bg-industrial-border/20">
                          <span className="text-xs font-mono text-industrial-accent uppercase">
                            {language}
                          </span>
                        </div>
                        <SyntaxHighlighter
                          style={dark} // Theme only — no conflict
                          language={language}
                          wrapLines={false}
                          showLineNumbers={false}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            padding: "1rem",
                            background: "transparent",
                          }}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc ml-4 mb-4 space-y-2 text-industrial-subtext marker:text-industrial-accent">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal ml-4 mb-4 space-y-2 text-industrial-subtext marker:text-industrial-accent">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-industrial-accent pl-4 text-industrial-subtext italic my-4">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-industrial-accent hover:underline decoration-dotted underline-offset-4"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Bar */}
        {!isUser && (
          <div
            className={`mt-2 flex ${side === "left" ? "justify-end" : "justify-start"}`}
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-industrial-subtext hover:text-industrial-accent hover:bg-industrial-border/30 transition-all rounded-sm"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "COPIED" : "COPY_DATA"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
