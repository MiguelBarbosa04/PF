export const getTTSFromAzure = async (text) => {
  const response = await fetch("http://localhost:8000/tts/azure", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const blob = await response.blob();
  return new Audio(URL.createObjectURL(blob));
};