import React from "react";

interface TextInputProps {
  text: string;
  onChange: (text: string) => void;
  placeholder: string;
  readOnly?: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  text,
  onChange,
  placeholder,
  readOnly = false,
}) => (
  <textarea
    value={text}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-20 p-4 border border-gray-300 rounded-lg mb-4 text-lg"
    placeholder={placeholder}
    rows={2}
    readOnly={readOnly}
  />
);

export default TextInput;
