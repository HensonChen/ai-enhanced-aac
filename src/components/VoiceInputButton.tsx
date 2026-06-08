"use client";

import { useEffect, useState } from "react";
import { isSpeechRecognitionSupported, startSpeechRecognition } from "@/lib/speechRecognition";

interface VoiceInputButtonProps {
  onText: (text: string) => void;
  locale?: string;
}

export function VoiceInputButton({ onText, locale = "en-US" }: VoiceInputButtonProps) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setSupported(isSpeechRecognitionSupported()), 0);
    return () => window.clearTimeout(id);
  }, []);

  if (!supported) return <p className="text-xs text-slate-500">Voice input is available in Chrome/Edge. Keyboard input still works.</p>;

  return (
    <button type="button" onClick={() => { setListening(true); startSpeechRecognition((text) => onText(text), () => setListening(false), locale); }} className={`rounded-full px-4 py-2 text-sm font-bold text-white ${listening ? "bg-red-500" : "bg-sky-600 hover:bg-sky-700"}`}>
      {listening ? "Listening..." : "Use voice"}
    </button>
  );
}
