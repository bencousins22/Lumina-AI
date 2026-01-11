
import { GoogleGenAI } from "@google/genai";
import { Message, AIConfig } from "../types";

// Initialize client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamCompletion = async (
  history: Message[], 
  userMessage: string,
  config: AIConfig,
  onChunk: (chunk: string) => void
): Promise<string> => {
  try {
    const chat = ai.chats.create({
      model: config.model,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
        topP: config.topP,
        topK: config.topK,
        thinkingConfig: config.thinkingBudget !== undefined && config.thinkingBudget > 0 ? { thinkingBudget: config.thinkingBudget } : undefined,
      },
      history: history.filter(m => m.role !== 'system').map(m => ({
        role: m.role as 'user' | 'model',
        parts: [{ text: m.content }],
      })),
    });

    const result = await chat.sendMessageStream({ message: userMessage });
    
    let fullText = '';
    for await (const chunk of result) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }
    return fullText;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = `\n\n**Error:** ${error.message || "An unexpected error occurred."}`;
    onChunk(errorMsg);
    return errorMsg;
  }
};

export const generateTitle = async (firstMessage: string): Promise<string> => {
   try {
     const response = await ai.models.generateContent({
       model: 'gemini-3-flash-preview',
       contents: `Generate a short, professional 3-5 word title for a conversation that starts with: "${firstMessage}". Return only the title text.`,
     });
     return response.text?.trim() || "New Conversation";
   } catch (e) {
     return "New Conversation";
   }
};
