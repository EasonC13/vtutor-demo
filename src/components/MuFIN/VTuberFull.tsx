// src/components/MuFIN/VTuber.tsx
import React, { useRef, useEffect, useState } from "react";

interface VTuberProps {
  iframe_origin?: string;
}

export const VTuberFull: React.FC<VTuberProps> = ({
  iframe_origin = "http://localhost:5500",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messageToSpeak, setMessageToSpeak] = useState("");

  useEffect(() => {
    const iframe = document.getElementById("unity-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.style.pointerEvents = "auto";
    }
  }, [iframe_origin]);

  const handleFeedbackGenerated = (message: string) => {
    setMessageToSpeak(message);
  };

  useEffect(() => {
    if (!isSpeaking && messageToSpeak) {
      speak(messageToSpeak);
      setMessageToSpeak("");
      setIsSpeaking(true);
    }
  }, [isSpeaking, messageToSpeak]);

  const speak = (feedback: string): void => {
    const iframe = document.getElementById("unity-iframe") as HTMLIFrameElement;
    try {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          { action: "unitySpeak", message: feedback },
          "*"
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent): void => {
      if (!iframe_origin.includes(event.origin)) {
        return;
      }

      if (event.data.type === "IFRAME_CLICK") {
        const iframe = document.getElementById(
          "unity-iframe"
        ) as HTMLIFrameElement;
        const { x, y } = event.data;

        if (iframe) {
          // iframe.style.pointerEvents = "none";
          const underlyingElements = document.elementsFromPoint(x, y);

          for (let i = 0; i < underlyingElements.length; i++) {
            const element = underlyingElements[i];

            if (element instanceof HTMLElement) {
              element.click();
              element.focus();
            }
          }
        }
      } else if (event.data.type === "VTuber_Message_Delivery_Complete") {
        setIsSpeaking(false);
        setMessageToSpeak("");
      }
    };

    const handleFeedbackGeneratedMessage = (
      event: CustomEvent<string>
    ): void => {
      handleFeedbackGenerated(event.detail);
    };

    window.addEventListener("message", handleIframeMessage);
    window.addEventListener(
      "feedbackGenerated",
      handleFeedbackGeneratedMessage as EventListener
    );

    return () => {
      window.removeEventListener("message", handleIframeMessage);
      window.removeEventListener(
        "feedbackGenerated",
        handleFeedbackGeneratedMessage as EventListener
      );
    };
  }, [iframe_origin]);

  return (
    <>
      <iframe
        src={iframe_origin}
        className="w-full h-full"
        id="unity-iframe"
        ref={iframeRef}
        // style={{ bottom: "0px", right: "0px" }}
      />
      <div
        id="overlay"
        className="fixed inset-0 z-50 bg-black opacity-0"
        onClick={(e) => {
          const overlay = e.currentTarget as HTMLDivElement;
          overlay.style.display = "none";
          const iframe = document.getElementById(
            "unity-iframe-overlay"
          ) as HTMLIFrameElement;
          if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(
              {
                type: "UNITY_CLICK",
                x: e.clientX,
                y: e.clientY,
              },
              "*"
            );
          }

          const underlyingElements = document.elementsFromPoint(
            e.clientX,
            e.clientY
          );
          for (const element of underlyingElements) {
            if (element instanceof HTMLElement) {
              element.click();
              element.focus();
            }
          }
        }}
      >
        <iframe
          src={iframe_origin}
          className="w-full h-full"
          id="unity-iframe-overlay"
          ref={iframeRef}
          // style={{ bottom: "0px", right: "0px" }}
        />
      </div>
    </>
  );
};