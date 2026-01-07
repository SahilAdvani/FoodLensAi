import asyncio
import edge_tts

async def test_tts():
    text = "नमस्ते दुनिया" 
    voice = "hi-IN-SwaraNeural"
    communicate = edge_tts.Communicate(text, voice)
    print(f"Testing TTS with voice: {voice}")
    
    audio_data = b""
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data += chunk["data"]
            
    if len(audio_data) > 0:
        print(f"Success! Generated {len(audio_data)} bytes.")
    else:
        print("Failed: No audio data received.")

if __name__ == "__main__":
    asyncio.run(test_tts())
