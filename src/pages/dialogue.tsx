import React, { useState, useEffect, useRef } from "react";
import { VTutorFull } from "@/components/MuFIN/VTutorFull";
import { VTutor } from "@/components/MuFIN/VTutor";
import { FaMicrophone } from "react-icons/fa";
import { toast } from "react-toastify";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

const LandingPage: React.FC = () => {
  const iframeOrigin =
    "https://21n9xvlltvccu73327jqjan64r2mlpqgwx2ry85a7bnj9l2wtg.walrus.site";
  const [text, setText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("zh-TW");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasStoppedRef = useRef<boolean>(false);
  const textRef = useRef<string>("");
  const [vtutorText, setVTutorText] = useState<string>("");

  const languages = [
    { code: "zh-TW", name: "繁體中文 (Traditional Chinese)" },
    { code: "zh-CN", name: "簡體中文 (Simplified Chinese)" },
    { code: "en-US", name: "English (US)" },
    { code: "ja-JP", name: "日本語 (Japanese)" },
    { code: "ko-KR", name: "한국어 (Korean)" },
    { code: "es-ES", name: "Español (Spanish)" },
    { code: "fr-FR", name: "Français (French)" },
    { code: "de-DE", name: "Deutsch (German)" },
  ];

  const handleSpeechTimeout = () => {
    console.log("handleSpeechTimeout", { text: textRef.current });
    if (!hasStoppedRef.current) {
      setText((prev) => {
        const newText = prev + "[stop]";
        textRef.current = newText;
        return newText;
      });
      hasStoppedRef.current = true;
    }
  };

  useEffect(() => {
    console.log("LANG", navigator.languages);
    if (typeof window !== "undefined") {
      // Initialize speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event: any) => {
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("");
          setText(transcript);
          textRef.current = transcript;
          hasStoppedRef.current = false;

          // Set new timeout
          timeoutRef.current = setTimeout(handleSpeechTimeout, 500);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }

          if (event.error === "network") {
            toast.error(
              "Speech recognition is not supported in this browser. Please use Chrome, Safari or Edge."
            );
          }
        };

        setRecognition(recognition);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedLanguage]);

  useEffect(() => {
    const handleVTutorMessage = (event: MessageEvent) => {
      if (event.data.type === "VTutor_Message_Delivery_Complete") {
        setIsSpeaking(false);
      }
    };

    window.addEventListener("message", handleVTutorMessage);
    return () => {
      window.removeEventListener("message", handleVTutorMessage);
    };
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      // setIsSpeaking(true);
      const output = "I Will Say: " + text;
      // setVTutorText(output);
      // console.log("output", output);
      const event = new CustomEvent("feedbackGenerated", {
        detail: output,
      });
      console.log({ event });
      window.dispatchEvent(event);
    }
  };

  const toggleMicrophone = () => {
    if (!recognition) {
      console.error("Speech recognition not supported");
      toast.error(
        "Speech recognition is not supported in this browser. Please use Chrome, Safari or Edge."
      );
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      // Clear timeout when microphone is turned off
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      recognition.start();
      setIsListening(true);
      hasStoppedRef.current = false;
      // Start timeout when microphone is turned on
      timeoutRef.current = setTimeout(handleSpeechTimeout, 1000);
    }
  };

  return (
    <div className="mx-5 flex flex-col md:flex-row items-center justify-between bg-white min-h-[80vh] py-5 px-4">
      {/* VTutor - on top for mobile, right side on desktop */}
      <div className="w-full md:hidden h-[80vw] flex items-center border rounded-lg mb-4">
        <VTutorFull />
      </div>

      {/* Controls section - full width on mobile, half width on desktop */}
      <div className="w-full md:w-1/2 md:pr-4">
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-lg"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <textarea
          value={textRef.current}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
            textRef.current = e.target.value;
          }}
          className="w-full h-20 p-4 border border-gray-300 rounded-lg mb-4 text-lg"
          placeholder="Enter text for VTutor to say..."
          rows={2}
        />
        <div
          onClick={toggleMicrophone}
          className={`w-32 h-32 mx-auto mb-4 rounded-full flex items-center justify-center cursor-pointer ${
            isListening ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <FaMicrophone className="w-16 h-16 text-white" />
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSpeaking}
          className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400"
        >
          Make VTutor Speak
        </button>
        <textarea
          value={vtutorText}
          readOnly
          className="w-full h-20 p-4 border border-gray-300 rounded-lg mt-4 text-lg"
          placeholder="VTutor will say..."
          rows={2}
        />
      </div>

      <div className="hidden md:flex w-full md:w-1/2 md:pl-4 h-[80vw] md:h-[40vw] items-center border rounded-lg">
        {/* <VTutorFull /> */}
        <VTutor />
      </div>
    </div>
  );
};

export default LandingPage;
