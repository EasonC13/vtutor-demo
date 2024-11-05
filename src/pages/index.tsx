import React, { useState, useEffect } from "react";
import Typewriter from "typewriter-effect";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import Image from "next/image";
import { VTuber } from "@/components/MuFIN/VTuber";

const LandingPage: React.FC = () => {
  const textOptions = [
    "Hello, I'm VTutor!",
    "你好，我是VTutor！",
    "こんにちは、私はVTutorです！",
    "안녕하세요, 저는 VTutor입니다!",
    "Hola, soy VTutor!",
    "Bonjour, je suis VTutor!",
    "Hallo, ich bin VTutor!",
    "Ciao, sono VTutor!",
    "Olá, eu sou o VTutor!",
    "Привет, я VTutor!",
  ];
  const iframeOrigins = [
    "https://1s1e9ue14cypff9k2ajuq1sxu2wzks4besj0i5tk5k5vc5uq2q.walrus.site",
    "https://5nrs6pijc01lp7rtde88sh8gdt5uk3mddw3k9bts13otpqctv6.walrus.site",
  ];
  const [text, setText] = useState(textOptions[0]);
  const [iframeOrigin, setIframeOrigin] = useState(iframeOrigins[0]);

  const handleSubmit = () => {
    const event = new CustomEvent("feedbackGenerated", {
      detail: text,
    });
    window.dispatchEvent(event);
  };
  const nextText = (currentText: string = text) => {
    const currentIndex = textOptions.indexOf(currentText);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % textOptions.length;
      setText(textOptions[nextIndex]);
    }
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === "VTuber_Message_Delivery_Complete") {
        nextText(event.data.message);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  const handleChangeStyle = () => {
    const currentIndex = iframeOrigins.indexOf(iframeOrigin);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % iframeOrigins.length;
      setIframeOrigin(iframeOrigins[nextIndex]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white min-h-[90vh] py-10 px-4">
      <div className="text-center mb-10 mt-5">
        <div className="font-bold text-4xl flex text-center justify-center items-center text-gray-800">
          <span className="mr-3">VTutor</span>
          <Typewriter
            options={{
              strings: [
                "Software Development Kit",
                "for Multi-Model Feedback",
                "Animated Pedagogical Agents",
                "with Generative AI",
              ],
              autoStart: true,
              loop: true,
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full ">
        <Link
          href="https://codepen.io/AnonymousForReview/pen/xxvaxJg"
          target="_blank"
          className="bg-blue-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200 "
        >
          <div className="mb-4">
            <img
              src="/vtutor/vtutor_demo_screenshot.jpg"
              alt="Decompiler"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div className="text-gray-800">
            <h2 className="text-2xl font-bold mb-2">SDK Live Demo</h2>
            <p className="mb-4">Easy to use examples in this link</p>
          </div>
        </Link>

        <Link
          href="/copilot"
          target="_blank"
          className="bg-blue-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="mb-4">
            <img
              src="/vtutor/vtutor_video.png"
              alt="Copilot"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div className="text-gray-800">
            <h2 className="text-2xl font-bold mb-2">Demo Video</h2>
            <p className="mb-4">
              Watch the demo video to see how VTutor works.
            </p>
          </div>
        </Link>
        <Link
          href="/vtutor/LAK25_VTutor.pdf"
          target="_blank"
          className="bg-blue-50 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        >
          <div className="mb-4">
            <img
              src="/vtutor/paper_preview.png"
              alt="Copilot"
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div className="text-gray-800">
            <h2 className="text-2xl font-bold mb-2">Paper</h2>
            <p className="mb-4">
              Read the paper to learn more about VTutor. (a full paper is coming
              soon)
            </p>
          </div>
        </Link>
      </div>
      <div className="flex justify-center items-center mt-10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border border-gray-300 rounded py-2 px-4 mr-4"
          placeholder="Enter text"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
        >
          VTutor, say something!
        </button>
        <button
          onClick={handleChangeStyle}
          className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-green-500 transition duration-300 ml-4"
        >
          Change Style
        </button>
      </div>
      <VTuber iframe_origin={iframeOrigin} />
    </div>
  );
};

export default LandingPage;
