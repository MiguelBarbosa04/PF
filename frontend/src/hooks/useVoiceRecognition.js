import { useState, useRef } from "react";

const useVoiceRecognition = (setInput) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const isVoiceMessage = useRef(false);

  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Este navegador não suporta reconhecimento de voz.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-PT";
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        isVoiceMessage.current = true;
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }

    if (!isListening) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return { isListening, toggleListening, isVoiceMessage };
};

export default useVoiceRecognition;
