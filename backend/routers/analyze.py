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
        print(f"\n[ROUTER /analyze] Request received for session_id='{session_id}', user_id='{user_id}', language='{language}'")
        loop = asyncio.get_running_loop()
        func = functools.partial(get_pipeline().analyze_image, image_bytes, language=language, user_prompt=user_prompt)
        result = await loop.run_in_executor(None, func)

        if not result.get("success"):
            err_msg = result.get("error", "Failed to detect text in image")
            print(f"[ROUTER /analyze WARNING] Pipeline returned un-successful: {err_msg}")
            if "hi" in language.lower():
                err_msg = "चित्र में कोई टेक्स्ट नहीं मिला। कृपया सामग्री (Ingredients) सूची की एक साफ़ फोटो अपलोड करें।"
            else:
                err_msg = "No readable text detected. Please upload a clear photo of the ingredients list."
            result["analysis"] = err_msg
            result["speech"] = err_msg
            return {
                "success": True,
                "data": result
            }

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
            print(f"[ROUTER /analyze INFO] Pipeline returned empty raw_analysis. Message: {msg}")
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

        try:
            supabase.table("messages").insert(assistant_message).execute()
            print("[ROUTER /analyze] Successfully saved assistant message to Supabase DB.")
        except Exception as db_err:
            print(f"[ROUTER /analyze DB ERROR] Failed saving message to Supabase: {db_err}")

        result["analysis"] = raw_analysis or formatted_content
        print("[ROUTER /analyze] Returning success response to client.\n")

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[ROUTER /analyze CRITICAL EXCEPTION]: {e}")
        raise HTTPException(status_code=500, detail=str(e))
