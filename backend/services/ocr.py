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
    Fast, reliable single/double-pass OCR extraction pipeline with full diagnostic logging.
    """
    try:
        print(f"[OCR LOG] Starting OCR text extraction for image payload ({len(image_bytes)} bytes)...")
        variants = preprocess_image_bytes(image_bytes)
        if not variants:
            print("[OCR ERROR] Preprocessing returned 0 image variants (Image decode or PIL opening failed)!")
            return ""

        print(f"[OCR LOG] Preprocessed {len(variants)} image variant(s). Target image size: {variants[0].size}")

        psm_modes = ["--psm 6 --oem 3", "--psm 3 --oem 3"]
        extracted_chunks = []
        target_img = variants[0]

        for psm in psm_modes:
            try:
                print(f"[OCR LOG] Attempting Tesseract pass with config: '{psm}'...")
                txt = pytesseract.image_to_string(target_img, lang="eng", config=psm)
                if txt and len(txt.strip()) > 15:
                    print(f"[OCR LOG SUCCESS] Extracted {len(txt.strip())} chars with config '{psm}'.")
                    extracted_chunks.append(txt)
                    break
                else:
                    print(f"[OCR LOG WARNING] Config '{psm}' returned empty or short text ({len(txt.strip()) if txt else 0} chars).")
            except Exception as tess_err:
                print(f"[OCR LOG EXCEPTION] Tesseract call failed for config '{psm}': {tess_err}")
                continue

        if not extracted_chunks and len(variants) > 1:
            try:
                print("[OCR LOG] Falling back to 2nd image variant with default config '--psm 6 --oem 3'...")
                txt = pytesseract.image_to_string(variants[1], lang="eng", config="--psm 6 --oem 3")
                if txt and len(txt.strip()) > 10:
                    print(f"[OCR LOG SUCCESS] Fallback variant extracted {len(txt.strip())} chars.")
                    extracted_chunks.append(txt)
                else:
                    print(f"[OCR LOG WARNING] Fallback variant also returned insufficient text ({len(txt.strip()) if txt else 0} chars).")
            except Exception as tess_err2:
                print(f"[OCR LOG EXCEPTION] Fallback variant call failed: {tess_err2}")

        if not extracted_chunks:
            print("[OCR LOG RESULT] Total extracted text from all passes: 0 characters.")
            return ""

        combined_text = "\n".join(extracted_chunks)
        clean_text = combined_text.replace("\r", " ").replace("\n", " ")
        clean_text = " ".join(clean_text.split())
        print(f"[OCR LOG RESULT] Final cleaned text ({len(clean_text)} chars): '{clean_text[:150]}...'")

        return clean_text

    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"[OCR CRITICAL EXCEPTION] Unexpected error during extract_text_from_image: {e}")
        return ""