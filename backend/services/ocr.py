import os
import io
import pytesseract
from PIL import Image

try:
    import cv2
    import numpy as np
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False

# Set Tesseract Valid Path
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
if os.path.exists(TESSERACT_PATH):
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def preprocess_image_bytes(image_bytes: bytes) -> list:
    """
    Advanced Multi-Variant Image Preprocessing pipeline for phone camera photos.
    Uses OpenCV CLAHE (Adaptive Local Contrast Equalization) + Sharpening kernel
    to eliminate shadows, glare, and lens blur on camera photos.
    """
    variants = []

    if HAS_OPENCV:
        try:
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is not None:
                h, w = img.shape[:2]
                if max(h, w) > 1800:
                    scale = 1800 / max(h, w)
                    img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

                # 1. CLAHE (Local shadow & glare removal)
                clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
                clahe_img = clahe.apply(gray)

                # 2. Sharpening filter for un-blurring mobile camera text
                kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
                sharpened = cv2.filter2D(clahe_img, -1, kernel)

                # Convert to PIL Image
                variants.append(Image.fromarray(sharpened))
                variants.append(Image.fromarray(gray))
        except Exception as e:
            print(f"[OCR] OpenCV preprocessing fallback warning: {e}")

    # Fallback to PIL standard grayscale if variants list is empty
    if not variants:
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            if pil_img.width > 1800 or pil_img.height > 1800:
                pil_img.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
            variants.append(pil_img.convert("L"))
        except Exception:
            pass

    return variants

def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Multi-pass OCR extraction pipeline:
    Runs OCR across enhanced image variants and multiple PSM modes to reliably capture 
    text even on blurry, shadowy, or angled mobile camera photos.
    """
    try:
        variants = preprocess_image_bytes(image_bytes)
        if not variants:
            return ""

        psm_modes = ["--psm 6 --oem 3", "--psm 4 --oem 3", "--psm 11 --oem 3"]
        extracted_chunks = []

        for img_var in variants:
            for psm in psm_modes:
                try:
                    txt = pytesseract.image_to_string(img_var, lang="eng", config=psm)
                    if txt and len(txt.strip()) > 15:
                        extracted_chunks.append(txt)
                except Exception:
                    continue

        if not extracted_chunks:
            return ""

        # Combine text from all passes and remove extra whitespace
        combined_text = "\n".join(extracted_chunks)
        clean_text = combined_text.replace("\r", " ").replace("\n", " ")
        clean_text = " ".join(clean_text.split())

        return clean_text

    except Exception as e:
        raise RuntimeError(f"OCR failed: {str(e)}")