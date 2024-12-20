import React from "react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (language: string) => void;
  languages: { code: string; name: string }[];
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onChange,
  languages,
}) => (
  <select
    value={selectedLanguage}
    onChange={(e) => onChange(e.target.value)}
    className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-lg"
  >
    {languages.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.name}
      </option>
    ))}
  </select>
);

export default LanguageSelector;
