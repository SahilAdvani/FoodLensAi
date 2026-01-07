import asyncio
import edge_tts

async def list_all_voices():
    """
    Lists all available voices from the Edge TTS service.
    Prints ShortName, Gender, and Locale for each.
    """
    try:
        voices = await edge_tts.list_voices()
        # Sort by Locale for better readability
        voices = sorted(voices, key=lambda x: x['Locale'])
        
        print(f"{'ShortName':<40} {'Gender':<10} {'Locale':<15}")
        print("="*70)
        
        for voice in voices:
            print(f"{voice['ShortName']:<40} {voice['Gender']:<10} {voice['Locale']:<15}")
            
        print("\n" + "="*70)
        print(f"Total Voices Available: {len(voices)}")

    except Exception as e:
        print(f"Error fetching voices: {e}")

if __name__ == "__main__":
    asyncio.run(list_all_voices())
