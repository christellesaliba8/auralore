// convex/chat.ts
import { action } from "./_generated/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateChatResponse = action({
  args: { message: "string" },
  handler: async ({ message }) => {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      });
      const reply = response.choices[0]?.message?.content || "No response";
      return { reply };
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate response from OpenAI");
    }
  },
});
