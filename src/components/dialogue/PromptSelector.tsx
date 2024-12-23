// src/components/dialogue/PromptSelector.tsx
import React from "react";

interface PromptSelectorProps {
  selectedPrompt: string;
  setSelectedPrompt: (prompt: string) => void;
  setSelectedLanguage: (language: string) => void;
}

const PromptSelector: React.FC<PromptSelectorProps> = ({
  selectedPrompt,
  setSelectedPrompt,
  setSelectedLanguage,
}) => {
  const prompts = [
    { id: "default", name: "Default Prompt" },
    { id: "japanese", name: "Po's Japanese Prompt", languageCode: "ja-JP" },
    { id: "chinese", name: "Eason's Chinese Prompt", languageCode: "zh-CN" },
    { id: "customize", name: "Create / test my own Prompt" },
    // Add more prompts here as needed
  ];

  return (
    <div className="mb-4">
      <label className="block text-gray-700 text-sm font-bold mb-2">
        Select a Prompt
      </label>
      <select
        value={JSON.stringify(prompts.find((p) => p.id === selectedPrompt))}
        onChange={(e) => {
          const optionValue = JSON.parse(e.target.value);
          setSelectedPrompt(optionValue.id);
          if (optionValue.languageCode) {
            setSelectedLanguage(optionValue.languageCode);
          }
        }}
        className="w-full p-2 border border-gray-300 rounded-lg"
      >
        {prompts.map((prompt) => (
          <option key={prompt.id} value={JSON.stringify(prompt)}>
            {prompt.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default PromptSelector;
