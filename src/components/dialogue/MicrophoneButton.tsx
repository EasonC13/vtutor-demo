import React from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";

interface MicrophoneButtonProps {
  isSpeaking: boolean;
  isListening: boolean;
  isRequestStop: boolean;
  toggleMicrophone: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isSpeaking,
  isListening,
  isRequestStop,
  toggleMicrophone,
}) => (
  <div
    onClick={toggleMicrophone}
    className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center cursor-pointer ${
      isRequestStop
        ? "bg-gray-500"
        : isListening || isSpeaking
        ? "bg-blue-500"
        : "bg-gray-300"
    }`}
  >
    {isSpeaking ? (
      <FaStop className="w-12 h-12 text-white" />
    ) : (
      <FaMicrophone className="w-12 h-12 text-white" />
    )}
  </div>
);

export default MicrophoneButton;
