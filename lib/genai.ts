import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({});

export async function generateEmbedding(text: string) {
  const response = await genai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: { outputDimensionality: 768 },
  });
  return response.embeddings![0].values as unknown as number[]; // Assuming single input
}

export async function generateResponse(prompt: string) {
  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash-lite-preview-09-2025",
    contents: prompt,
  });
  return response.text as string;
}
