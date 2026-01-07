import pytesseract
from PIL import Image
import io


import os

# Set Tesseract Valid Path
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH 

def extract_text_from_image(image_bytes: bytes) -> str:    
    """
    Extract text from an image using Tesseract OCR.        
    Returns cleaned text (safe for NLP).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))        

        # Optimization: Resize if image is too large (reduces OCR time significantly)
        # 1500px is sufficient for ingredient text and faster
        if image.width > 1500 or image.height > 1500:      
            image.thumbnail((1500, 1500), Image.Resampling.LANCZOS)

        image = image.convert("L")  # grayscale

        text = pytesseract.image_to_string(
            image,
            lang="eng",
            config="--psm 6 --oem 3"
        )

        text = text.replace("\n", " ")
        text = " ".join(text.split())

        return text


    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")   