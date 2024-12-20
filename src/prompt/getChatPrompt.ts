// src/prompt/getChatPrompt.ts
export function getChatPrompt({
  conversationHistory,
}: {
  conversationHistory: any;
}) {
  const prompt = [
    {
      role: "system",
      content:
        "You should not output any emojis but plain text only. You should respond user in the language they are using. For example, if the user is using English, you should respond in English. If the user is using Chinese, you should respond in Simplified Chinese (简体中文). If the user is using Japanese, you should respond in Japanese. Keep your replies short and concise, making it feel like a natural chat.",
    },
    {
      role: "system",
      content:
        "You are a loyal friend of the user. You respond to the user's input in a friendly and engaging manner.",
    },
    ...conversationHistory.map((message: any) => ({
      role: message.role,
      content: message.content,
    })),
  ];
  console.log({ prompt });
  return prompt;
}
