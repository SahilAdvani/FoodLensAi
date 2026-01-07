from fastapi import APIRouter, HTTPException, Depends, Response
from pydantic import BaseModel
from elevenlabs.client import ElevenLabs
import os
import edge_tts
import asyncio

router = APIRouter()

# Circuit breaker to prevent repeated failed calls to ElevenLabs
_elevenlabs_unhealthy = False

  
tts_lock = asyncio.Lock()

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "RABOvaPec1ymXz02oDQi"

async def generate_edge_tts(text: str, voice: str) -> bytes:
    communicate = edge_tts.Communicate(text, voice)        
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
    return audio_data

@router.post("/tts")
async def text_to_speech(request: TTSRequest):
    global _elevenlabs_unhealthy

    # Acquire lock to ensure sequential processing
    async with tts_lock:
        api_key = os.getenv("ELEVENLABS_API_KEY")

        # Try ElevenLabs first (only if healthy to avoid latency)
        if api_key and not _elevenlabs_unhealthy:
            try:
                print(f"Attempting ElevenLabs TTS...")     
                client = ElevenLabs(api_key=api_key)       
                audio_stream = client.text_to_speech.convert(
                    text=request.text,
                    voice_id=request.voice_id,
                    model_id="eleven_multilingual_v2",     
                    output_format="mp3_44100_128",
                    optimize_streaming_latency=3
                )
                audio_data = b""
                for chunk in audio_stream:
                    if chunk:
                        audio_data += chunk

                print(f"ElevenLabs TTS Success: {len(audio_data)} bytes")
                return Response(content=audio_data, media_type="audio/mpeg")

            except Exception as e:
                print(f"ElevenLabs Warning: {e}")
                print("Marking ElevenLabs as unhealthy. Switching to Edge TTS fallback permanently.")
                _elevenlabs_unhealthy = True

        try:
            is_hindi = any(0x0900 <= ord(c) <= 0x097F for c in request.text)

            edge_voice = "hi-IN-SwaraNeural" if is_hindi else "en-US-AvaNeural"

            print(f"Generating Edge TTS ({edge_voice})...")
            audio_data = await generate_edge_tts(request.text, edge_voice)

            return Response(content=audio_data, media_type="audio/mpeg")

        except Exception as e:
            print(f"Critical TTS Failure: {e}")
            raise HTTPException(status_code=500, detail=str(e))
