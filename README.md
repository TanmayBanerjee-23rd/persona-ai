# Persona

A minimalist, full-stack AI chatbot that remembers you and builds a personality profile from your conversations.

- Lets you chat naturally with an AI (gemini-2.5-flash from google-genai)
- Persists every conversation in Pinecone vector database (free tier)
- Learns from your chat history using sentence embeddings
- When you ask “Who am I?” or “Tell me about myself” (after at least 3 messages), it generates a fun, accurate personality-style profile based on everything you’ve said

Features

- Clean, mobile-friendly UI with Tailwind CSS
- Zero-cost LLM & embeddings (Google GenAI free tier)
- Persistent memory via Pinecone serverless index
- Retrieval-augmented profile generation
- Full TypeScript codebase
- Jest tests for core logic
- Single-user demo (easy to extend with auth)

Tech stack: Next.js 14 (app router) • React • TypeScript • Tailwind • Google GenAI Inference • Pinecone • Jest

## Setup

1. Get Gemini GenAI token: https://aistudio.google.com/api-keys (free tier)
2. Get Pinecone key/env: https://app.pinecone.io (free tier)
3. Fill .env for below variables
   - GEMINI_API_KEY=<YOUR_GEMINI_API_KEY>
   - PINECONE_API_KEY=<YOUR_PINECONE_API_KEY>
   - PINECONE_ENVIRONMENT=<YOUR_PINECONE_ENV>
   - PINECONE_INDEX_NAME=<YOUR_PINECONE_INDEX_NAME>
4. npm install
5. npm run dev

## Tests

npm test

## Notes

- Profile triggers after 3+ messages.
- Uses free Gemini GenAI API (rate-limited).
- Pinecone stores embeddings for history retrieval.
