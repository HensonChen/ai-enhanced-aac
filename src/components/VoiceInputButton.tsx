"use client";

import { useEffect, useRef, useState } from "react";
import { isSpeechRecognitionSupported, startSpeechRecognition } from "@/lib/speechRecognition";

interface VoiceInputButtonProps {
  onText: (text: string) => void;
  locale?: string;
}

export function VoiceInputButton({ onText, locale = "en-US" }: VoiceInputButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<ReturnType<typeof startSpeechRecognition>>(null);

  useEffect(() => {
    const id = window.setTimeout(() => setSupported(isSpeechRecognitionSupported()), 0);
    return () => {
      window.clearTimeout(id);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Clean up failed for speech recognition on unmount:", e);
        }
      }
    };
  }, []);

  if (!supported) return <p className="text-xs text-slate-500">Voice input is available in Chrome/Edge. Keyboard input still works.</p>;

  const handleToggle = () => {
    setError(null);
    if (listening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Failed to stop speech recognition:", e);
        }
      }
      setListening(false);
      recognitionRef.current = null;
    } else {
      setListening(true);
      const instance = startSpeechRecognition(
        (text) => onText(text),
        () => {
          setListening(false);
          recognitionRef.current = null;
        },
        (err) => {
          // If no-speech error, we don't need to alert the user
          if (err !== "no-speech") {
            setError(err);
          }
        },
        locale
      );
      recognitionRef.current = instance;
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleToggle}
        className={`rounded-full px-4 py-2 text-sm font-bold text-white transition active:scale-95 ${
          listening ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-sky-600 hover:bg-sky-700"
        }`}
      >
        {listening ? "Stop voice" : "Use voice"}
      </button>
      {error && (
        <span className="max-w-[200px] text-right text-[10px] font-semibold leading-tight text-red-500 mt-1">
          {error === "network"
            ? "Transcription service unreachable. Check connection, or try Safari/Edge."
            : error === "not-allowed"
            ? "Microphone permission denied. Allow mic access."
            : error === "service-not-allowed"
            ? "Speech service not allowed by browser/OS."
            : `Voice error: ${error}`}
        </span>
      )}
    </div>
  );
}
