import { useState, useRef, useEffect } from "react";
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export function useAzureSpeechRecognition({ azureKey, azureRegion, onResult }) {
  const [isListening, setIsListening] = useState(false);
  const recognizerRef = useRef(null);

  const startListening = () => {
    if (recognizerRef.current) return; // já ativo

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(azureKey, azureRegion);
    speechConfig.speechRecognitionLanguage = "pt-PT";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizerRef.current = recognizer;

    recognizer.recognized = (_, event) => {
      if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
        onResult(event.result.text);
      }
    };

    recognizer.startContinuousRecognitionAsync(() => {
      setIsListening(true);
    }, (err) => {
      console.error("Erro ao iniciar reconhecimento:", err);
    });
  };

  const stopListening = () => {
    if (!recognizerRef.current) return;
    recognizerRef.current.stopContinuousRecognitionAsync(() => {
      setIsListening(false);
      recognizerRef.current.close();
      recognizerRef.current = null;
    }, (err) => {
      console.error("Erro ao parar reconhecimento:", err);
    });
  };

  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync(() => {
          recognizerRef.current.close();
          recognizerRef.current = null;
        });
      }
    };
  }, []);

  return { isListening, startListening, stopListening };
}
