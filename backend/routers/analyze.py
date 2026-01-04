from fastapi import APIRouter, UploadFile, File, HTTPException
from services.pipeline import FoodAnalysisPipeline

router = APIRouter()
pipeline = FoodAnalysisPipeline()


@router.post("/analyze")
async def analyze_image(image: UploadFile = File(...)):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file")

    image_bytes = await image.read()
    try:
        result = pipeline.analyze_image(image_bytes)

        return {
            "success": True,
            "data": result
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
