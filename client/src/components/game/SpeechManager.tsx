import { useEffect, useRef } from "react";
import { useAudio } from "@/lib/stores/useAudio";

export function SpeechManager() {
  const isMuted = useAudio((state) => state.isMuted);
  const dequeueSpeech = useAudio((state) => state.dequeueSpeech);
  const clearSpeechQueue = useAudio((state) => state.clearSpeechQueue);

  const processingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const handleVisibility = () => {
      if (document.hidden) {
        window.speechSynthesis.cancel();
        clearSpeechQueue();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let raf: number;
    const processQueue = () => {
      const synthesis = window.speechSynthesis;
      if (!processingRef.current && !isMuted && !synthesis.speaking) {
        const next = dequeueSpeech();
        if (next) {
          processingRef.current = true;
          const utterance = new SpeechSynthesisUtterance(next.text);
          utterance.lang = next.lang ?? "es-ES";
          if (typeof next.rate === "number") utterance.rate = next.rate;
          if (typeof next.pitch === "number") utterance.pitch = next.pitch;
          if (typeof next.volume === "number") utterance.volume = next.volume;

          const speak = () => {
            synthesis.speak(utterance);
          };

          if ("requestIdleCallback" in window) {
            (window as any).requestIdleCallback(() => speak(), { timeout: 250 });
          } else {
            setTimeout(() => speak(), 0);
          }

          utterance.onend = () => {
            processingRef.current = false;
          };
          utterance.onerror = () => {
            processingRef.current = false;
          };
        }
      }

      raf = window.requestAnimationFrame(processQueue);
    };

    raf = window.requestAnimationFrame(processQueue);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.speechSynthesis.cancel();
    };
  }, [clearSpeechQueue, dequeueSpeech, isMuted]);

  return null;
}
