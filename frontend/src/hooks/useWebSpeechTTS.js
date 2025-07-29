import { useState, useRef, useEffect } from "react";

const useWebSpeechTTS = (registerStop) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);

  const speak = (text) => {
    stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-PT";
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);

    return () => stop();
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    utteranceRef.current = null;
  };

  useEffect(() => {
    if (registerStop) registerStop(stop);
    return () => stop();
  }, []);

  return { isSpeaking, speak, stop };
};

export default useWebSpeechTTS;