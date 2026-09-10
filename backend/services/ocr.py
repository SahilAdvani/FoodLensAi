import os
import io
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter

# Set Tesseract Valid Path
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """
    Enhance low-contrast, shadowy, or slightly blurry mobile camera photos.
    """
    # 1. Resize if image is too large (up to 1800px max)
    if image.width > 1800 or image.height > 1800:
        image.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    
    # 2. Convert to Grayscale
    gray = image.convert("L")

    # 3. Boost Contrast & Sharpening to eliminate shadows and un-blur edges
    contrast_enhancer = ImageEnhance.Contrast(gray)
    enhanced = contrast_enhancer.enhance(1.8)

    sharpness_enhancer = ImageEnhance.Sharpness(enhanced)
    sharpened = sharpness_enhancer.enhance(2.0)

    # 4. Optional subtle sharpen filter
    final_img = sharpened.filter(ImageFilter.SHARPEN)
    
    return final_img

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Multi-pass OCR extraction pipeline:
    Applies image preprocessing + multi-PSM mode OCR passes to reliably capture 
    text even on blurry, angled, or table-cluttered mobile camera photos.
    """
    try:
        raw_image = Image.open(io.BytesIO(image_bytes))
        enhanced_image = preprocess_image_for_ocr(raw_image)

        # Multi-pass OCR: Try standard block (PSM 6) and multi-column layout (PSM 4)
        psm_modes = ["--psm 6 --oem 3", "--psm 4 --oem 3"]
        extracted_chunks = []

        for psm in psm_modes:
            try:
                txt = pytesseract.image_to_string(enhanced_image, lang="eng", config=psm)
                if txt and len(txt.strip()) > 10:
                    extracted_chunks.append(txt)
            except Exception:
                continue

        # If contrast-enhanced OCR yielded minimal text, retry on raw grayscale image
        if not extracted_chunks:
            gray_raw = raw_image.convert("L")
            txt = pytesseract.image_to_string(gray_raw, lang="eng", config="--psm 6 --oem 3")
            if txt:
                extracted_chunks.append(txt)

        # Combine text from all passes
        combined_text = "\n".join(extracted_chunks)
        
        # Clean formatting
        clean_text = combined_text.replace("\r", " ").replace("\n", " ")
        clean_text = " ".join(clean_text.split())

        return clean_text

    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")