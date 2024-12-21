import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import AnimatedWaves from "@/components/animation/AnimatedWaves";
import LanguageSelector from "@/components/dialogue/LanguageSelector";
import MicrophoneButton from "@/components/dialogue/MicrophoneButton";
import TextInput from "@/components/dialogue/TextInput";
import { VTutorFull } from "@/components/MuFIN/VTutorFull";
import { FiExternalLink } from "react-icons/fi";
import { translate } from "@vitalets/google-translate-api";
import { HttpProxyAgent } from "http-proxy-agent";

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// Set up CORS proxy
// translate.setCORS("http://cors-anywhere.herokuapp.com/");

const LandingPage: React.FC = () => {
  const iframeOrigin =
    "https://21n9xvlltvccu73327jqjan64r2mlpqgwx2ry85a7bnj9l2wtg.walrus.site";
  const [text, setText] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isRequestStop, setIsRequestStop] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("zh-CN");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasStoppedRef = useRef<boolean>(false);
  const textRef = useRef<string>("");
  const [vtutorText, setVTutorText] = useState<string>("");
  const conversationHistoryRef = useRef<
    {
      role: "user" | "assistant";
      content: string;
    }[]
  >([]);
  const [isPiPMode, setIsPiPMode] = useState<boolean>(false);
  const pipWindowRef = useRef<any>(null);
  const [nativeLanguage, setNativeLanguage] = useState<string>("en-US");
  const [TranslatedVTutorText, setTranslatedVTutorText] = useState<string>("");

  const languages = [
    { code: "zh-CN", name: "簡體中文 (Simplified Chinese)" },
    { code: "zh-TW", name: "繁體中文 (Traditional Chinese)" },
    { code: "en-US", name: "English (US)" },
    { code: "ja-JP", name: "日本語 (Japanese)" },
    { code: "ko-KR", name: "한국어 (Korean)" },
    { code: "es-ES", name: "Español (Spanish)" },
    { code: "fr-FR", name: "Français (French)" },
    { code: "de-DE", name: "Deutsch (German)" },
  ];

  const handleSpeechTimeout = async () => {
    console.log("handleSpeechTimeout", {
      text: textRef.current,
      hasStoppedRef: hasStoppedRef.current,
      timeoutRef: timeoutRef.current,
    });
    if (!hasStoppedRef.current && timeoutRef.current) {
      timeoutRef.current = null;
      hasStoppedRef.current = true;
      recognitionRef.current.stop();
      setIsListening(false);
      handleSubmit();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage;

        recognition.onresult = (event: any) => {
          // Clear existing timeout
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join("");
          setText(transcript);
          textRef.current = transcript;
          hasStoppedRef.current = false;

          // Set new timeout
          timeoutRef.current = setTimeout(handleSpeechTimeout, 1000);
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

        recognitionRef.current = recognition;

        if (isListening) {
          recognition.start();
        }
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selectedLanguage, isListening]);

  useEffect(() => {
    const handleVTutorMessage = (event: MessageEvent) => {
      console.log("handleVTutorMessage", event);
      if (event.data.type === "VTuber_Message_Delivery_Complete") {
        setIsSpeaking(false);
        if (!isRequestStop) {
          toggleMicrophone();
        }
        setIsRequestStop(false);
      }
    };

    window.addEventListener("message", handleVTutorMessage);
    if (pipWindowRef.current) {
      pipWindowRef.current.addEventListener("message", handleVTutorMessage);
    }

    return () => {
      window.removeEventListener("message", handleVTutorMessage);
      if (pipWindowRef.current) {
        pipWindowRef.current.removeEventListener(
          "message",
          handleVTutorMessage
        );
      }
    };
  }, [isRequestStop, isPiPMode]);

  useEffect(() => {
    const translateText = async () => {
      if (vtutorText) {
        try {
          const response = await axios.post("/api/translate", {
            text: vtutorText,
            targetLanguage: nativeLanguage.split("-")[0],
          });
          setTranslatedVTutorText(response.data.translatedText);
        } catch (err) {
          console.error("Translation error:", err);
        }
      }
    };
    translateText();
  }, [vtutorText, nativeLanguage]);

  const handleSubmit = () => {
    // If text is empty, stop listening and return
    if (!textRef.current.trim()) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
      return;
    }

    // Otherwise trigger timeout effect to end conversation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      handleSpeechTimeout();
      return;
    }

    const run = async () => {
      if (
        conversationHistoryRef.current[
          conversationHistoryRef.current.length - 1
        ]?.role === "user"
      ) {
        return;
      }
      const userInput = textRef.current;
      setIsSpeaking(true);
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "user", content: userInput },
      ];

      const result = await axios.post("/api/openai/chat", {
        userInput,
        conversationHistory: conversationHistoryRef.current,
      });
      const response = result.data;
      setVTutorText(response);
      const event = new CustomEvent("feedbackGenerated", {
        detail: response,
      });
      window.dispatchEvent(event);
      if (pipWindowRef.current) {
        pipWindowRef.current.dispatchEvent(event);
      }
      conversationHistoryRef.current = [
        ...conversationHistoryRef.current,
        { role: "assistant", content: response },
      ];
    };
    run();
  };

  const toggleMicrophone = () => {
    if (isSpeaking) {
      setIsRequestStop(true);
      return;
    }

    setText("");
    textRef.current = "";
    if (!recognitionRef.current) {
      console.error("Speech recognition not supported");
      toast.error(
        "Speech recognition is not supported in this browser. Please use Chrome, Safari or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Clear timeout when microphone is turned off
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      hasStoppedRef.current = false;
      // Start timeout when microphone is turned on
      if (textRef.current) {
        timeoutRef.current = setTimeout(handleSpeechTimeout, 2000);
      }
    }
  };

  const isMobile = window.innerWidth < 768;

  const getButtonText = () => {
    if (isListening || isSpeaking) {
      return (
        <div className="flex items-center justify-center p-1">
          <AnimatedWaves color="white" />{" "}
        </div>
      );
    }
    return "Chat With VTutor";
  };

  const handlePiP = async () => {
    const iframe: any = document.getElementById("vtutor-container");
    const placeholder = document.createElement("div");
    placeholder.style.width = iframe.clientWidth + "px";
    placeholder.style.height = iframe.clientHeight + "px";
    placeholder.style.border = "2px dashed #ccc";
    placeholder.style.display = "flex";
    placeholder.style.alignItems = "center";
    placeholder.style.justifyContent = "center";
    placeholder.innerHTML = "VTutor is in Picture-in-Picture mode";
    placeholder.className = "bg-gray-100 rounded-lg";

    if (iframe && "documentPictureInPicture" in window) {
      try {
        if (!isPiPMode && window.documentPictureInPicture) {
          const pipOptions = {
            initialAspectRatio: iframe.clientWidth / iframe.clientHeight,
            lockAspectRatio: true,
            copyStyleSheets: true,
          };

          const pipWindow = await (
            window as any
          ).documentPictureInPicture.requestWindow(pipOptions);
          pipWindowRef.current = pipWindow;
          iframe.parentNode.insertBefore(placeholder, iframe);
          pipWindow.document.body.append(iframe);

          pipWindow.document.body.style.display = "flex";
          pipWindow.document.body.style.margin = "0";

          pipWindow.addEventListener(
            "unload",
            () => {
              placeholder.parentNode?.replaceChild(iframe, placeholder);
              setIsPiPMode(false);
              pipWindowRef.current = null;
            },
            { once: true }
          );

          setIsPiPMode(true);
        } else if (isPiPMode) {
          (window as any).documentPictureInPicture.window.close();
          setIsPiPMode(false);
          pipWindowRef.current = null;
        }
      } catch (error) {
        console.error("Error with Document Picture-in-Picture:", error);
      }
    } else {
      console.error("No iframe element found or Document PiP not supported.");
    }
  };

  const getVtutorContainerClass = () => {
    if (isPiPMode) {
      return "w-[100vh] h-[100vh] fixed";
    }
    return "w-full md:w-1/2 md:pl-4 h-[80vw] md:h-[40vw] items-center border rounded-lg relative";
  };

  return (
    <div className="mx-5 flex flex-col md:flex-row-reverse gap-4 items-center justify-between bg-white min-h-[80vh] py-5 px-4">
      <div className={getVtutorContainerClass()} id="vtutor-container">
        <VTutorFull
          iframe_origin={iframeOrigin}
          pipWindowRef={pipWindowRef}
          parentIsSpeaking={isSpeaking}
        />
        {!isPiPMode && (
          <FiExternalLink
            className="absolute top-2 right-2 cursor-pointer"
            onClick={handlePiP}
          />
        )}
      </div>

      <div className="w-full md:w-1/2 md:pr-4">
        <LanguageSelector
          selectedLanguage={nativeLanguage}
          onChange={setNativeLanguage}
          languages={languages}
          label="Your Native Language"
        />
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onChange={setSelectedLanguage}
          languages={languages}
          label="The Language You Are Speaking"
        />
        <TextInput
          text={textRef.current}
          onChange={(value) => {
            setText(value);
            textRef.current = value;
          }}
          placeholder="Enter text for VTutor to say..."
        />
        <MicrophoneButton
          isSpeaking={isSpeaking}
          isListening={isListening}
          isRequestStop={isRequestStop}
          toggleMicrophone={toggleMicrophone}
        />
        <button
          onClick={handleSubmit}
          disabled={isSpeaking}
          className="w-full mb-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
        >
          {getButtonText()}
        </button>
        <TextInput
          text={vtutorText}
          onChange={() => {}}
          placeholder="VTutor will say..."
          readOnly
        />
        <textarea
          value={TranslatedVTutorText}
          readOnly
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg text-lg"
          placeholder="Translated text will appear here..."
        />
      </div>
    </div>
  );
};

export default LandingPage;
