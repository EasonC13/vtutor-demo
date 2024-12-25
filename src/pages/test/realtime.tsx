// src/pages/test/realtime.tsx
import { useEffect, useState } from "react";
import { RealtimeClient } from "@openai/realtime-api-beta";

export default function RealtimePage() {
  const [client, setClient] = useState<RealtimeClient | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const audioContext = new AudioContext();
    let audioBufferQueue: Int16Array[] = [];
    let isPlaying = false;

    const initializeClient = async () => {
      const realtimeClient = new RealtimeClient({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowAPIKeyInBrowser: true,
      });
      realtimeClient.updateSession({
        instructions: "Your name is Alice, You are a great, upbeat friend.",
      });
      realtimeClient.updateSession({
        voice: "alloy",
      });
      realtimeClient.updateSession({
        turn_detection: { type: "server_vad" }, // or 'server_vad'
        input_audio_transcription: { model: "whisper-1" },
      });

      // Set up conversation event handling
      realtimeClient.on("conversation.updated", (event) => {
        const { item, delta } = event;
        console.log({ item, delta });

        if (delta && delta.audio) {
          console.log("audioBufferQueue.push(new Int16Array(delta.audio));");
          audioBufferQueue.push(new Int16Array(delta.audio));

          if (!isPlaying) {
            playAudioQueue();
          }
        }

        const items = realtimeClient.conversation.getItems();
        const formattedAudio = items.map((item) => item.formatted?.audio);

        // Convert Int16Array queue to array of arrays for JSON serialization
        const serializedQueue = audioBufferQueue.map((arr) => Array.from(arr));
        const queueJson = JSON.stringify(serializedQueue);

        // Convert back from JSON to Int16Array array
        const deserializedQueue = JSON.parse(queueJson).map(
          (arr) => new Int16Array(arr)
        );

        console.log("Original queue:", audioBufferQueue);
        console.log("Serialized JSON:", queueJson);
        console.log("Deserialized queue:", deserializedQueue);

        setMessages(items);
      });

      realtimeClient.on("server.response.output_item.done", (event) => {
        console.log("speech_stopped", event);
      });

      // Connect to Realtime API
      try {
        console.log("await realtimeClient.connect();");
        await realtimeClient.connect();
        console.log("AAAA");

        setClient(realtimeClient);
      } catch (error) {
        console.error("Failed to connect to Realtime API:", error);
      }
    };

    const playAudioQueue = async () => {
      if (audioBufferQueue.length === 0) {
        isPlaying = false;
        return;
      }

      isPlaying = true;
      const audioData = audioBufferQueue.shift();
      if (!audioData) {
        isPlaying = false;
        return;
      }

      try {
        const float32Array = new Float32Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          float32Array[i] = audioData[i] / 32768;
        }

        const audioBuffer = audioContext.createBuffer(
          1,
          float32Array.length,
          audioContext.sampleRate
        );

        audioBuffer.getChannelData(0).set(float32Array);

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Apply a low-pass filter
        const filter = audioContext.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(3000, audioContext.currentTime); // Adjust frequency as needed

        source.connect(filter);
        filter.connect(audioContext.destination);

        source.onended = playAudioQueue;
        source.playbackRate.value = 0.5;

        source.start();
      } catch (error) {
        console.error("Error decoding or playing audio:", error);
        isPlaying = false;
      }
    };

    // Ensure AudioContext is running
    if (audioContext.state === "suspended") {
      audioContext.resume().then(() => {
        console.log("AudioContext resumed");
      });
    }

    initializeClient();

    // Cleanup on unmount
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  const sendMessage = async (text: string) => {
    console.log({ client });
    if (!client) return;

    try {
      await client.sendUserMessageContent([{ type: "input_text", text }]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Realtime Chat</h1>
      </div>

      <div className="space-y-4">
        {messages.map((message, index) => (
          <div key={index} className="p-2 border rounded">
            {typeof message.content === "string"
              ? message.content
              : JSON.stringify(message.content)}
          </div>
        ))}
      </div>

      <div className="mt-4">
        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              const input = e.target as HTMLInputElement;
              sendMessage(input.value);
              input.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
