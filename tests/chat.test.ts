// tests/chat.test.ts
// Important: This file uses node environment (ensured by jest.config.js)

import { POST } from "../app/api/chat/route"; // Direct import of handler
import { generateEmbedding, generateResponse } from "../lib/genai";
import { storeMessage, retrieveRelevantMessages } from "../lib/pinecone";
import { NextRequest } from "next/server";

// Mock everything
jest.mock("../lib/genai");
jest.mock("../lib/pinecone");

const mockedGenerateEmbedding = generateEmbedding as jest.Mock;
const mockedGenerateResponse = generateResponse as jest.Mock;
const mockedStoreMessage = storeMessage as jest.Mock;
const mockedRetrieveRelevantMessages = retrieveRelevantMessages as jest.Mock;

describe("/api/chat POST", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles normal chat message (no profile trigger)", async () => {
    // Mock embeddings and response
    mockedGenerateEmbedding.mockImplementation((text: string) =>
      Promise.resolve([0.1, 0.2])
    ); // fake vector
    mockedGenerateResponse.mockResolvedValue("Hello! How can I help?");

    // Create mock request
    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Hi there",
        history: [{ role: "user", content: "Previous message" }],
      }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ reply: "Hello! How can I help?" });

    // Verify calls
    expect(mockedGenerateEmbedding).toHaveBeenCalledTimes(2); // user msg + assistant reply
    expect(mockedRetrieveRelevantMessages).not.toHaveBeenCalled(); // no profile query
    expect(mockedStoreMessage).toHaveBeenCalledTimes(2);
    expect(mockedGenerateResponse).toHaveBeenCalledWith(
      expect.stringContaining("Respond to the user")
    );
  });

  it("generates profile when triggered and history >= 3", async () => {
    const fakeHistory = [
      { role: "user", content: "I love hiking" },
      { role: "assistant", content: "Cool!" },
      { role: "user", content: "And coding" },
      { role: "assistant", content: "Nice!" },
    ];

    mockedGenerateEmbedding.mockResolvedValue([0.5, 0.6]);
    mockedRetrieveRelevantMessages.mockResolvedValue([
      { role: "user", content: "I love hiking", timestamp: 1 },
      { role: "assistant", content: "Thats cool", timestamp: 2 },
      { role: "user", content: "I love coding as well", timestamp: 3 },
      { role: "assistant", content: "Thats great", timestamp: 4 },
    ]);
    mockedGenerateResponse.mockResolvedValue("You are an adventurous coder!");

    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Who am I?",
        history: fakeHistory,
      }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.reply).toBe("You are an adventurous coder!");

    expect(mockedRetrieveRelevantMessages).toHaveBeenCalled();
    expect(mockedGenerateResponse).toHaveBeenCalledWith(
      expect.stringContaining("generate a short personality-style profile")
    );
    expect(mockedGenerateResponse).toHaveReturned();
  });

  it("does not generate profile if history < 3", async () => {
    mockedGenerateEmbedding.mockResolvedValue([0.1, 0.2]);
    mockedGenerateResponse.mockResolvedValue("Not enough info yet.");

    const req = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      body: JSON.stringify({
        message: "Tell me about myself",
        history: [{ role: "user", content: "Hi" }],
      }),
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.reply).toBe("Not enough info yet.");

    expect(mockedRetrieveRelevantMessages).toHaveBeenCalledTimes(1); // for profile query
    expect(mockedGenerateResponse).toHaveBeenCalledWith(
      expect.stringContaining("generate a short personality-style profile")
    );
    expect(mockedStoreMessage).not.toHaveBeenCalled();
  });
});
