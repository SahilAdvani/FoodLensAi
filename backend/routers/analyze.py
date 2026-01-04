from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from services.pipeline import FoodAnalysisPipeline
from database import supabase
import json

router = APIRouter()
pipeline = FoodAnalysisPipeline()


@router.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: Optional[str] = Form(None)
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
            "content": "Image uploaded for analysis",
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
        result = pipeline.analyze_image(image_bytes)
        print(f"DEBUG: Pipeline result keys: {result.keys()}")
        if 'analysis' in result:
             print(f"DEBUG: Analysis type: {type(result['analysis'])}")
             print(f"DEBUG: Analysis preview: {result['analysis'][:100]}...")

        # 3. Save Assistant Message
        assistant_message = {
             "session_id": session_id,
             "role": "assistant",
             "content": json.dumps(result), # Store structured data or just description? Using description for now, or raw json? Schema says text.
             # If schema is content text, better to store stringified JSON or just the main text. 
             # Let's store the description + name for readability, or JSON if we want to re-parse.
             # Given the frontend expects structured data, let's store JSON string.
             "source": "analysis_result"
        }
        if user_id:
            assistant_message["user_id"] = user_id

        supabase.table("messages").insert(assistant_message).execute()

        return {
            "success": True,
            "data": result
        }
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error during analysis or result saving: {e}")
        raise HTTPException(status_code=500, detail=str(e))
