from fastapi import APIRouter, UploadFile, File, HTTPException
import asyncio
from services.ocr import extract_text_from_image
from services.extractor import extract_ingredients

router = APIRouter()


@router.post("/scan")
async def scan_image(image: UploadFile = File(...)):       
    if not image.content_type.startswith("image/"):        
        raise HTTPException(status_code=400, detail="Invalid image file")

    image_bytes = await image.read()

    try:
        loop = asyncio.get_running_loop()

        text = await loop.run_in_executor(None, extract_text_from_image, image_bytes)
        ingredients = extract_ingredients(text)
        return {
            "success": True,
            "raw_text": text,
            "ingredients": ingredients
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
