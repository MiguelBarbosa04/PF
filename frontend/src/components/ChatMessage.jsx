import React, {useEffect, useRef} from "react";
import StarsRating from "./StarsRating.jsx";
import { FaVolumeUp } from "react-icons/fa";
import useAzureTTS from "../hooks/useAzureTTS.js";

const ChatMessage = ({ msg, onRate, stopAll, addStopFn, isVoiceInput = false }) => {
  const isBot = msg.remetente === "bot";
  //const [isSpeaking, setIsSpeaking] = useState(false);
  const { isSpeaking, speak, stop } = useAzureTTS(() => addStopFn && addStopFn(stop));
  const hasSpokenRef = useRef(false);

  /*const handleSpeakClick = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      onStop();
      setIsSpeaking(false);
    } else {
      onSpeak(msg.conteudo);
      setIsSpeaking(true);
    }
  };*/

  useEffect(() => {
    if (isBot && isVoiceInput && !hasSpokenRef.current) {
      hasSpokenRef.current = true;
      const stopFn = speak(msg.conteudo);
      addStopFn(stopFn);
    } else if (!isVoiceInput) {
      hasSpokenRef.current = false;
    }
  }, [isVoiceInput, msg.id]);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      stopAll(); // Parar outros
      speak(msg.conteudo);
    }
  };

  return (
    <div className={`chat-message ${isBot ? "bot" : "user"}`}>
      <div>{msg.conteudo}</div>
      {isBot && (
        <div className="chat-feed">
          <div className="chat-feed-left">
            <StarsRating
              className="chat-star"
              avaliacao={msg.avaliacao}
              onAvaliar={(nota) => onRate(msg.id, nota)}
            />
            <button className="chat-speak" onClick={handleToggleSpeak}>
              <FaVolumeUp style={{ color: isSpeaking ? "#1e88e5" : "inherit" }}/>
            </button>
          </div>
          <p className="chat-modelo">Modelo: {msg.modelo}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
