const useSpeechSynthesis = () => {
  const speak = (text) => {
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.startsWith("pt"));

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = ptVoice;
    utterance.lang = ptVoice?.lang || "pt-PT";
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
  };

  return { speak, stop };
};

export default useSpeechSynthesis;