// src/components/MuFIN/VTutorFull.tsx
import React, { useRef, useEffect, useState } from "react";

interface VTutorProps {
  iframe_origin?: string;
  pipWindowRef?: React.RefObject<any>;
  parentIsSpeaking?: boolean;
}

export const VTutorFull: React.FC<VTutorProps> = ({
  iframe_origin = "https://21n9xvlltvccu73327jqjan64r2mlpqgwx2ry85a7bnj9l2wtg.walrus.site",
  pipWindowRef,
  parentIsSpeaking = false,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isSpeaking, setIsSpeaking] = useState(parentIsSpeaking);
  const [messageToSpeak, setMessageToSpeak] = useState("");

  useEffect(() => {
    const iframe = document.getElementById("unity-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.style.pointerEvents = "auto";
    }
  }, [iframe_origin]);

  useEffect(() => {
    if (parentIsSpeaking == false && isSpeaking == true) {
      setIsSpeaking(false);
      setMessageToSpeak("");
    }
  }, [parentIsSpeaking]);

  const handleFeedbackGenerated = (message: string) => {
    setMessageToSpeak(message);
    console.log({ messageToSpeak, isSpeaking });
  };

  useEffect(() => {
    console.log("Use Effect", { messageToSpeak, isSpeaking });
    if (!isSpeaking && messageToSpeak) {
      speak(messageToSpeak);
      setMessageToSpeak("");
      setIsSpeaking(true);
    }
  }, [isSpeaking, messageToSpeak]);

  const speak = (feedback: string): void => {
    let iframe = document.getElementById("unity-iframe") as HTMLIFrameElement;
    if (!iframe && pipWindowRef?.current) {
      iframe = pipWindowRef.current.document.getElementById(
        "unity-iframe"
      ) as HTMLIFrameElement;
    }
    console.log({ iframe, pipWindowRef });
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
      console.log("handleFeedbackGeneratedMessage");
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
  }, [iframe_origin, pipWindowRef]);

  return (
    <>
      <iframe
        src={iframe_origin}
        className={`w-full h-full`}
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
          const overlayIframe = document.getElementById("unity-iframe-overlay");
          if (overlayIframe) {
            overlayIframe.remove();
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
