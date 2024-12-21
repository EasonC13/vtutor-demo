import React from "react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  onChange: (language: string) => void;
  languages: { code: string; name: string }[];
  label?: string;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onChange,
  languages,
  label,
}) => (
  <div>
    {label && (
      <label className="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>
    )}
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
  </div>
);

export default LanguageSelector;
