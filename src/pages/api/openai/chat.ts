// src/pages/api/openai/chat.ts
import OpenAI from "openai";
import { NextApiRequest, NextApiResponse } from "next";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import { getChatPrompt } from "@/prompt/getChatPrompt";
import { getPoJapanesePrompt } from "@/prompt/getPoJapanesePrompt";
import { getCustomPrompt } from "@/prompt/getCustomPrompt";
import { getEasonChinesePrompt } from "@/prompt/getEasonChinesePrompt";

export const config = {
  runtime: "edge",
  regions: [
    "arn1",
    "bom1",
    "cdg1",
    "cle1",
    "cpt1",
    "dub1",
    "fra1",
    "gru1",
    // "hkg1",
    "hnd1",
    "iad1",
    "icn1",
    "kix1",
    "lhr1",
    "pdx1",
    "sfo1",
    "sin1",
    "syd1",
  ],
};

export default async function handler(req: NextRequest) {
  const ip = await fetch("https://ip.me").then((res) => res.text());

  console.log("Server IP:", ip);
  const {
    conversationHistory,
    userInput,
    api_key,
    selectedPrompt,
    customPrompt,
  } = await req.json();

  let prompt;
  if (selectedPrompt === "default") {
    prompt = getChatPrompt({ conversationHistory });
  } else if (selectedPrompt === "japanese") {
    prompt = getPoJapanesePrompt({ conversationHistory });
  } else if (selectedPrompt === "customize") {
    prompt = getCustomPrompt({ conversationHistory, customPrompt });
  } else if (selectedPrompt === "chinese") {
    prompt = getEasonChinesePrompt({ conversationHistory });
  }

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
