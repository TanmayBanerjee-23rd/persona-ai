// components/MarkdownMessage.tsx
"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownMessageProps {
  content: string;
}

export default function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "text";
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className="bg-gray-800 text-orange-300 px-1.5 py-0.5 rounded text-sm font-medium"
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
              className="my-4 rounded-lg overflow-hidden" // Wrapper for custom border/margin
              style={{
                fontSize: "14px",
                border: "1px solid #e5e7eb", // Subtle border
                overflowX: "auto", // Horizontal scroll for long lines
              }}
            >
              <SyntaxHighlighter
                style={dark} // Theme only — no conflict
                language={language}
                wrapLines={false}
                showLineNumbers={false}
                PreTag="div"
                // {...props}  // Safe spread (no customStyle)
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          );
        },
        // Rest of your components (h1, ul, etc.) unchanged
        h1: ({ children }) => (
          <h1 className="text-2xl font-bold mt-6 mb-3">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside my-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside my-3 space-y-1">
            {children}
          </ol>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-300">
            {children}
          </blockquote>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
