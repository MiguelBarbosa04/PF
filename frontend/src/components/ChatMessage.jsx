import React, {useEffect, useRef} from "react";
import StarsRating from "./StarsRating.jsx";
import { FaVolumeUp } from "react-icons/fa";
import useAzureTTS from "../hooks/useAzureTTS.js";
import useWebSpeechTTS from "../hooks/useWebSpeechTTS.js";
import {useLanguage} from "../locales/LanguageContext.jsx";

const ChatMessage = ({ msg, onRate, stopAll, addStopFn, isVoiceInput = false, ttsProvider = "azure"  }) => {
  const isBot = msg.remetente === "bot";
  const hasSpokenRef = useRef(false);
  const azureTTS = useAzureTTS();
  const webTTS = useWebSpeechTTS();
  const isSpeaking = ttsProvider === "azure" ? azureTTS.isSpeaking : webTTS.isSpeaking;
  const speak = ttsProvider === "azure" ? azureTTS.speak : webTTS.speak;
  const stop = ttsProvider === "azure" ? azureTTS.stop : webTTS.stop;
  const { t } = useLanguage();

  useEffect(() => {
    if (addStopFn) addStopFn(stop);
  }, [ttsProvider]);

  useEffect(() => {
    if (isBot && isVoiceInput && !hasSpokenRef.current) {
      hasSpokenRef.current = true;

      setTimeout(() => {
        const result = speak(msg.conteudo);
        if (result instanceof Promise) {
          result.then((stopFn) => addStopFn(stopFn));
        } else {
          addStopFn(result);
        }
      }, 0);
    } else if (!isVoiceInput) {
      hasSpokenRef.current = false;
    }
  }, [isVoiceInput, msg.id, ttsProvider]);

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      stopAll(); // Parar outros
      speak(msg.conteudo);
    }
  };

  function markdownParaHTML(text) {
    // Título
    text = text.replace(
      /Instruções passo a passo:/,
      '<h3>Instruções passo a passo:</h3>'
    );

    // Detecta "Passo X:" e aplica negrito
    text = text.replace(/(Passo \d+:)/g, '<b>$1</b>');

    // Adiciona <br/> antes de cada "Passo X:" para simular quebra de linha
    text = text.replace(/<b>Passo \d+:<\/b>/g, (match) => `<br/><br/>${match}`);

    return text;
  }

  return (
    <div className={`chat-message ${isBot ? "bot" : "user"}`}>
      <div dangerouslySetInnerHTML={{ __html: markdownParaHTML(msg.conteudo) }}/>
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
          <p className="chat-modelo">{t("chat-modelo")}: {msg.modelo}</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
