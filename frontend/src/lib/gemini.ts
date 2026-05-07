import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is not defined in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY || "");

// Используем модель gemini-2.5-flash-lite
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite"
});

export async function chatWithGemini(prompt: string, history: { role: string; parts: { text: string }[] }[] = []) {
  try {
    // Gemini API требует, чтобы история начиналась с сообщения пользователя ('user').
    // Находим индекс первого сообщения от пользователя.
    const firstUserIndex = history.findIndex(m => m.role === "user");
    const validHistory = firstUserIndex !== -1 ? history.slice(firstUserIndex) : [];

    const chat = model.startChat({
      history: validHistory,
    });

    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
