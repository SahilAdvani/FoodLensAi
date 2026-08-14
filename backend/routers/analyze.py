from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from database import supabase
import json
import re
import asyncio
import functools
router = APIRouter()
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        print("Lazy loading FoodAnalysisPipeline...")      
        from services.pipeline import FoodAnalysisPipeline 
        _pipeline = FoodAnalysisPipeline()
    return _pipeline


@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: Optional[str] = Form(None),
    language: str = Form("en"),
    user_prompt: Optional[str] = Form(None)
):
    if not image.content_type.startswith("image/"):        
        raise HTTPException(status_code=400, detail="Invalid image file")

    image_bytes = await image.read()

    # Validate UUIDs
    if not session_id or session_id == "null":
        raise HTTPException(status_code=400, detail="Invalid Session ID")

    # Handle user_id "null" string from FormData
    if user_id == "null" or not user_id:
        user_id = None

    # 1. Save User Message
    try:
        user_message = {
            "session_id": session_id,
            "role": "user",
            "content": f"Image uploaded for analysis. Question: {user_prompt}" if user_prompt else "Image uploaded for analysis",      
            "source": "image_upload"
        }
        if user_id:
            user_message["user_id"] = user_id

        supabase.table("messages").insert(user_message).execute()

    except Exception as e:
        print(f"Error saving user message: {e}")
        # Continue execution even if logging fails? Maybe. 

    try:
        # 2. Analyze
        loop = asyncio.get_running_loop()
        func = functools.partial(get_pipeline().analyze_image, image_bytes, language=language, user_prompt=user_prompt)
        result = await loop.run_in_executor(None, func)
        print(f"DEBUG: Pipeline result keys: {result.keys()}")
        if 'analysis' in result:
             print(f"DEBUG: Analysis type: {type(result['analysis'])}")
             print(f"DEBUG: Analysis preview: {result['analysis'][:100]}...")

        # Format the content into Markdown before saving   
        raw_analysis = result.get("analysis", "")
        formatted_content = raw_analysis

        if raw_analysis:
            # Directly use the generated structured Markdown
            if "hi" in language.lower():
                formatted_content += "\n\n**क्या आप इनमें से किसी के बारे में और जानना चाहते हैं? बस माइक टैप करें और पूछें!** 🎙️"
                result["speech"] = re.sub(r'#|\*|`|⚠️|✅|🟢|🟡|🔴', '', raw_analysis)[:300]
            else:
                formatted_content += "\n\n**Do you want to know more about any of these? Just tap the mic and ask!** 🎙️"
                result["speech"] = re.sub(r'#|\*|`|⚠️|✅|🟢|🟡|🔴', '', raw_analysis)[:300]
        else:
            msg = result.get("message", "Analysis complete but no ingredients identified.")
            if "better quality image" in msg:
                if "hi" in language.lower():
                    msg = "कृपया थोड़ी बेहतर गुणवत्ता वाली इमेज के साथ पुनः प्रयास करें।"
                else:
                    msg = "Please try again with a better quality image."
            elif "No recognizable ingredients" in msg:
                if "hi" in language.lower():
                    msg = "कोई पहचान योग्य सामग्री नहीं मिली।"
            formatted_content = msg
            result["speech"] = formatted_content

        assistant_message = {
             "session_id": session_id,
             "role": "assistant",
             "content": formatted_content,
             "source": "analysis_result"
        }
        if user_id:
            assistant_message["user_id"] = user_id

        supabase.table("messages").insert(assistant_message).execute()

        # Update cleanup to be safe
        if 'clean_json' in locals():
            result["analysis"] = clean_json
        else:
            result["analysis"] = raw_analysis

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error during analysis or result saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))
