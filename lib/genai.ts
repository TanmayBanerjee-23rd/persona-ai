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
  const geminiModels = [
    "gemini-2.5-pro",
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-09-2025",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash-lite-preview-09-2025",
    "gemini-2.0-flash",
    "gemini-2.0-pro",
    "gemini-2.5-flash-live",
    "gemini-2.0-flash-live",
  ];

  return tryGenerateResponseWithModels(prompt, geminiModels, 0);
}

async function tryGenerateResponseWithModels(
  prompt: string,
  models: string[],
  index: number
): Promise<string> {
  if (index >= models.length) {
    return "Sorry,PersonA is exhausted! Unable to generate response.";
  }

  try {
    console.log(`Trying model ${models[index]} at index ${index}`);

    const response = await genai.models.generateContent({
      model: models[index],
      contents: prompt,
    });
    return response.text as string;
  } catch (error: any) {
    const parsedError = JSON.parse(error.message);
    console.error(
      `Error with model ${models[index]} :: Code :: `,
      parsedError.error.code,
      " :: Message :: ",
      parsedError.error.message
    );

    return tryGenerateResponseWithModels(prompt, models, index + 1);
  }
}
