// src/pages/api/math/openai.ts
import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import { getChatPrompt } from "@/prompt/getChatPrompt";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const { conversationHistory, userInput, api_key } = await req.json();

  const prompt = getChatPrompt({ conversationHistory, userInput });
  let openai_api_key = api_key;
  if (!openai_api_key) {
    openai_api_key = process.env.OPENAI_API_KEY;
  }

  const openai = new OpenAI({
    apiKey: openai_api_key,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: prompt,
    stream: true,
  });

  const stream = OpenAIStream(response);

  return new StreamingTextResponse(
    new ReadableStream({
      async start(controller) {
        const reader = stream.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const result = await reader.read();
            if (result.done) {
              controller.close();
              break;
            }
            const textChunk = decoder.decode(result.value, { stream: true });
            controller.enqueue(result.value);
          }
        } catch (error) {
          controller.error(error);
        }
      },
    })
  );
}
