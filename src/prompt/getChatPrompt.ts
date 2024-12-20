// src/prompt/getChatPrompt.ts
export function getChatPrompt({
  conversationHistory,
  userInput,
}: {
  conversationHistory: any;
  userInput: any;
}) {
  const prompt = [
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
  console.log(prompt);
  return prompt;
}
