import { useState, useEffect, useRef } from "react";
import {useLanguage} from "../locales/LanguageContext.jsx";

const useAzureTTS = (registerStop) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef(null);
  const lastTextRef = useRef("");
  const { t } = useLanguage();
  const speak = async (text) => {
    if (isSpeaking && lastTextRef.current === text) {
      stop();
      return;
    }

    stop(); // Garante que qualquer som anterior para

    try {
      const res = await fetch("http://localhost:8000/tts/azure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error(t("useAzureTTS-error"));

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      lastTextRef.current = text;

      audio.play();
      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        lastTextRef.current = "";
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
    } catch (error) {
      console.error(t("useAzureTTS-error-audio"), error);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
      audioRef.current = null;
    }
  };

  useEffect(() => {
    if (registerStop) registerStop(stop);
    return () => stop(); // Para ao desmontar componente
  }, []);

  return { isSpeaking, speak, stop };
};

export default useAzureTTS;