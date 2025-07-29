from fastapi import APIRouter, Body, Response
import requests
import os
from backend.schemas.tts import TextRequest
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/tts", tags=["tts"])

VITE_AZURE_TTS_KEY = os.getenv("VITE_AZURE_SPEECH_KEY")
VITE_AZURE_REGION = os.getenv("VITE_AZURE_SPEECH_REGION")

@router.post("/azure")
def azure_tts(payload: TextRequest):
    text = payload.text
    token_url = f"https://{VITE_AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
    headers = {"Ocp-Apim-Subscription-Key": VITE_AZURE_TTS_KEY}
    token = requests.post(token_url, headers=headers).text
    #voice = "pt-PT-FernandaNeural"
    voice = "pt-PT-DuarteNeural"

    tts_url = f"https://{VITE_AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1"
    ssml = f"""
    <speak version='1.0' xml:lang='pt-PT'>
      <voice name='{voice}'>{text}</voice>
    </speak>"""

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
    }

    res = requests.post(tts_url, headers=headers, data=ssml)
    return Response(content=res.content, media_type="audio/mpeg")