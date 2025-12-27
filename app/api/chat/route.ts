import { NextRequest, NextResponse } from "next/server";
import { generateEmbedding, generateResponse } from "../../../lib/genai";
import { storeMessage, retrieveRelevantMessages } from "../../../lib/pinecone";

export async function POST(req: NextRequest) {
  const { message, history } = await req.json();

  let reply: string;
  let replyCategory: string = "General";
  let replySubCategory: string = "General";
  let shouldStoreMessageAndReply = true;

  // Check for profile query after a few messages
  const profileTriggers = ["who am i", "tell me about myself"];

  if (
    profileTriggers.some((trigger) => message.toLowerCase().includes(trigger))
  ) {
    shouldStoreMessageAndReply = false;

    const queryEmbedding = await generateEmbedding(
      "user personality profile summary"
    );

    const pastMessages = await retrieveRelevantMessages(queryEmbedding, 20); // Retrieve up to 20

    if (pastMessages.length >= 3) {
      // Generate profile
      const sortedMessages = pastMessages.sort(
        (a, b) => a.timestamp - b.timestamp
      );

      const chatHistory = sortedMessages
        .map((msg) => `${msg.role}: ${msg.content}`)
        .join("\n");

      const prompt = `Based on this chat history, generate a short personality-style profile for the user:\n${chatHistory}\nProfile:`;
      const replyInJson = removeUnsupportedCharacters(
        await generateResponse(prompt)
      );

      const parsedReply = JSON.parse(replyInJson);
      reply = parsedReply.response;
      replyCategory = "User Profile";
      replySubCategory = "Personality Summary";
    } else {
      reply = "Sorry, I don't have enough context to generate a profile yet.";
      replyCategory = "User Profile";
      replySubCategory = "Personality Summary";
    }
  } else {
    // Normal chat response
    const historyText = history
      .map(
        (msg: { role: string; content: string }) =>
          `${msg.role}: ${msg.content}`
      )
      .join("\n");

    const prompt = `
    Current chat history as context :\n${historyText}\n users new request: ${message}\n`;

    const replyInJson = removeUnsupportedCharacters(
      await generateResponse(prompt)
    );

    console.log("Agent reply in JSON :: ", replyInJson);

    const parsedReply = JSON.parse(replyInJson);
    reply = parsedReply.response;
    replyCategory = parsedReply.category;
    replySubCategory = parsedReply.subCategory;
  }

  if (shouldStoreMessageAndReply) {
    // Store user message
    const userEmbedding = await generateEmbedding(message);
    await storeMessage(userEmbedding, {
      role: "user",
      content: message,
      category: replyCategory,
      subCategory: replySubCategory,
      timestamp: Date.now(),
    });

    // Store assistant reply
    const assistantEmbedding = await generateEmbedding(reply);
    await storeMessage(assistantEmbedding, {
      role: "assistant",
      content: reply,
      category: replyCategory,
      subCategory: replySubCategory,
      timestamp: Date.now(),
    });
  }

  return NextResponse.json({ reply });
}

const removeUnsupportedCharacters = (text: string) => {
  text = text.replaceAll("`", "");
  text = text.replace("json", "");
  return text;
};
