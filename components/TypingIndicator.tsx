import React from "react";

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center gap-2 py-2 px-3 border-l-2 border-industrial-accent/50 bg-industrial-accentDim font-mono text-xs text-industrial-accent">
      <span className="animate-pulse">PROCESSING_DATA</span>
      <div className="flex space-x-1">
        <div
          className="w-1.5 h-1.5 bg-industrial-accent rounded-sm animate-bounce"
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-industrial-accent rounded-sm animate-bounce"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="w-1.5 h-1.5 bg-industrial-accent rounded-sm animate-bounce"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
    </div>
  );
};

export default TypingIndicator;
