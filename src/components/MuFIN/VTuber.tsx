// src/components/MuFIN/VTuber.tsx
import React, { useRef, useEffect } from "react";

interface VTuberProps {
  iframe_origin?: string;
}

export const VTuber: React.FC<VTuberProps> = ({
  iframe_origin = "https://6a75nc081bjm7x53qm01fsbz8a0dx952fqzqv2mnxs3zg3pzrl.walrus.site",
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = document.getElementById("unity-iframe") as HTMLIFrameElement;
    if (iframe) {
      iframe.style.pointerEvents = "auto";
    }
  }, [iframe_origin]);

  const handleFeedbackGenerated = (feedback: string): void => {
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
          iframe.style.pointerEvents = "none";
          const underlyingElements = document.elementsFromPoint(x, y);

          for (let i = 0; i < underlyingElements.length; i++) {
            const element = underlyingElements[i];

            if (element instanceof HTMLElement) {
              element.click();
              element.focus();
            }
          }
        }
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
    <iframe
      src={iframe_origin}
      width="300px"
      height="300px"
      className="fixed w-screen h-screen"
      id="unity-iframe"
      ref={iframeRef}
      style={{ bottom: "0px", right: "0px" }}
    />
  );
};
