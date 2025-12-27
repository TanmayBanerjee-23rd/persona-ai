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
      config: {
        systemInstruction: `
          You are an highly intelligent and helpful voice assistant. 
          You respond to user queries in a concise and informative manner.
          You answer in a friendly and engaging manner.
          Your answer should be in maximum of 500 words.
          You do also categorize your generated response 
          into one of the following categories and Sub-Category:
          Category - Scientific Classification Systems - Sub-Categories such as Biology, Chemistry, Physics and Mathematics;
          Category - Philosophical/Existential Categories - Sub-Categories such as Mind, Matter, Ethics, 
          Metaphysics, Epistemology and Logic;
          Category - Practical/Everyday Categorizations - Sub-Categories such as Food & Cooking, 
          Travel & Geography, Fashion & Lifestyle, Home & Garden, Finance & Economics, 
          Relationships & Social Dynamics, Career & Professional Development, Hobbies & Interests,
          Technology & Computing, Arts & Literature, History & Culture, 
          General Knowledge, Entertainment & Media, Health & Wellness, 
          Environment & Nature, Education & Learning, Sports & Recreation.
          Provide the response in below JSON format:
          {
            "response": "Your answer to the user's query",
            "category": "The category of the user's intent",
            "subCategory": "The sub-category of the user's intent"
          }
            and shall contain nothing else other than this JSON.
          `,
      },
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
