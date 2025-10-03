import { createGoogleGenerativeAI } from "@ai-sdk/google";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});
