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
    user_id: Optional[str] = Form(None),
    language: str = Form("en")
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
        result = pipeline.analyze_image(image_bytes, language=language)
        print(f"DEBUG: Pipeline result keys: {result.keys()}")
        if 'analysis' in result:
             print(f"DEBUG: Analysis type: {type(result['analysis'])}")
             print(f"DEBUG: Analysis preview: {result['analysis'][:100]}...")

        # Format the content into Markdown before saving
        raw_analysis = result.get("analysis", "")
        formatted_content = raw_analysis
        
        try:
             # Clean potential markdown code blocks
             clean_json = raw_analysis
             if "```json" in clean_json:
                 clean_json = clean_json.replace("```json", "").replace("```", "")
             elif "```" in clean_json:
                 clean_json = clean_json.replace("```", "")
                 
             parsed = json.loads(clean_json)
             if "results" in parsed and isinstance(parsed["results"], list):
                 formatted_content = ""
                 suggested_ingredients = []
                 for item in parsed["results"]:
                     name = item.get('ingredient', 'Unknown')
                     suggested_ingredients.append(name)
                     evidence = item.get('evidence', '')
                     explanation = item.get('explanation', '')
                     safety = '⚠️ Caution' if 'risk' in evidence.lower() or 'unsafe' in evidence.lower() else '✅ Safe'
                     
                     formatted_content += f"### {name} {safety}\n{explanation}\n\n"
                
                 # Friendly Awareness Footer
                 formatted_content += "\n\n**Do you want to know more about any of these? Just tap the mic and ask!** 🎙️"
             else:
                 formatted_content = result.get("message", "Analysis complete but no ingredients identified.")
                 
        except Exception as e:
             # Fallback if parsing fails
             print(f"JSON formatting failed: {e}")
             formatted_content = raw_analysis

        # 3. Save Assistant Message
        assistant_message = {
             "session_id": session_id,
             "role": "assistant",
             "content": formatted_content, 
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
