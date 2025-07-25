import React, {useState} from "react";
import StarsRating from "./StarsRating.jsx";
import { FaVolumeUp } from "react-icons/fa";

const ChatMessage = ({ msg, onRate, onSpeak, onStop }) => {
  const isBot = msg.remetente === "bot";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakClick = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      onStop();
      setIsSpeaking(false);
    } else {
      onSpeak(msg.conteudo);
      setIsSpeaking(true);
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
            <button className="chat-speak" onClick={handleSpeakClick}>
              <FaVolumeUp />
            </button>
          </div>
          <p className="chat-modelo">Modelo: {msg.modelo}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
