// src/pages/api/translate.ts
import { NextApiRequest, NextApiResponse } from "next";
import { translate } from "@vitalets/google-translate-api";
import { HttpProxyAgent } from "http-proxy-agent";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, targetLanguage } = req.body;

  if (!text || !targetLanguage) {
    return res.status(400).json({ error: "Missing text or target language" });
  }

  try {
    // const agent = new HttpProxyAgent("http://67.43.236.20:10145");
    const translation = await translate(text, {
      to: targetLanguage,
      // fetchOptions: { agent },
    });
    res.status(200).json({ translatedText: translation.text });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
}
