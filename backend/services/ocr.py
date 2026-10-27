import os
import io
import base64
import httpx
from dotenv import load_dotenv

load_dotenv()

# Optional local Tesseract fallback configuration
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
HAS_LOCAL_TESSERACT = False

try:
    import pytesseract
    from PIL import Image
    if os.path.exists(TESSERACT_PATH):
        pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH
    HAS_LOCAL_TESSERACT = True
except ImportError:
    HAS_LOCAL_TESSERACT = False


def _detect_mime_type(image_bytes: bytes) -> str:
    if image_bytes.startswith(b"\x89PNG"):
        return "image/png"
    if image_bytes.startswith(b"RIFF") and b"WEBP" in image_bytes[:12]:
        return "image/webp"
    return "image/jpeg"


def extract_text_with_gemini(image_bytes: bytes, api_key: str) -> str:
    """
    Tier 1: Google Gemini Flash Lite Vision OCR
    Runs via lightweight HTTPS REST call (0 MB server RAM).
    Prioritizes Gemini 3.5 Flash Lite (500 RPD, 15 RPM) first,
    then Gemini 3.1 Flash Lite (500 RPD, ~4s latency),
    then Gemini 3.8 Flash (20 RPD fallback).
    """
    try:
        mime_type = _detect_mime_type(image_bytes)
        b64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": b64_image
                            }
                        },
                        {
                            "text": (
                                "You are a high-precision OCR engine for food product packaging. "
                                "Transcribe ALL text visible on this food label verbatim, especially the ingredients list, "
                                "allergen warnings, and product name. "
                                "Do not add markdown formatting, bullet points, summaries, or explanations. "
                                "Return ONLY the raw transcribed text exactly as printed."
                            )
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 1024
            }
        }
        
        # Priority order based on user API quota:
        # 1. gemini-3.5-flash-lite: 500 RPD, 15 RPM
        # 2. gemini-3.1-flash-lite: 500 RPD, 15 RPM (ultra-fast ~4s)
        # 3. gemini-3.8-flash: 20 RPD, 5 RPM (conserved quota fallback)
        models_to_try = ["gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-3.8-flash"]
        
        for model in models_to_try:
            try:
                url = f"https://generativelanguage.googleapis.com/v1/models/{model}:generateContent?key={api_key}"
                
                with httpx.Client(timeout=35.0) as client:
                    response = client.post(url, json=payload)
                    if response.status_code == 200:
                        data = response.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                text = parts[0].get("text", "").strip()
                                if len(text) > 10:
                                    print(f"[OCR] Gemini ({model}) transcription succeeded.")
                                    return text
                    else:
                        print(f"[OCR] Gemini {model} HTTP {response.status_code}: {response.text[:150]}")
            except Exception as err:
                print(f"[OCR] Gemini {model} attempt error: {err}")
                continue
    except Exception as e:
        print(f"[OCR] Gemini Vision OCR failed: {e}")
        
    return ""


def extract_text_with_cloud_ocr(image_bytes: bytes) -> str:
    """
    Tier 2: Free Cloud OCR API (OCR.space)
    Runs via lightweight HTTPS REST call (0 MB server RAM, 25k free req/month).
    """
    try:
        api_key = os.getenv("OCR_SPACE_API_KEY")
        if api_key and api_key.strip():
            api_key = api_key.strip()
            print(f"[OCR] Cloud OCR.space using configured API key ({api_key[:4]}****)")
        else:
            api_key = "helloworld"
            print("[OCR WARNING] OCR_SPACE_API_KEY not found in environment. Using throttled 'helloworld' default.")

        files = {
            "file": ("image.jpg", image_bytes, "image/jpeg")
        }
        # Try Engine 1 first (standard reliable OCR), then Engine 2 (specialized numbers/symbols)
        for engine in [1, 2]:
            data = {
                "apikey": api_key,
                "language": "eng",
                "isOverlayRequired": False,
                "detectOrientation": True,
                "scale": True,
                "OCREngine": engine
            }
            
            with httpx.Client(timeout=18.0) as client:
                response = client.post("https://api.ocr.space/parse/image", files=files, data=data)
                if response.status_code == 200:
                    res_json = response.json()
                    if res_json.get("OCRExitCode") == 1:
                        results = res_json.get("ParsedResults", [])
                        if results:
                            text = results[0].get("ParsedText", "").strip()
                            if len(text) > 10:
                                return text
                else:
                    print(f"[OCR] Cloud OCR.space HTTP {response.status_code}: {response.text[:200]}")
                    # If throttled or unauthorized, retrying the second engine with the same key will also fail
                    if response.status_code in (401, 403, 503):
                        break
    except Exception as e:
        print(f"[OCR] Cloud OCR.space failed: {e}")
        
    return ""


def extract_text_with_local_tesseract(image_bytes: bytes) -> str:
    """
    Tier 3: Local Tesseract OCR (Emergency offline fallback only).
    """
    if not HAS_LOCAL_TESSERACT:
        return ""
    try:
        from PIL import Image
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("L")
        if pil_img.width > 1600 or pil_img.height > 1600:
            pil_img.thumbnail((1600, 1600))
        
        text = pytesseract.image_to_string(pil_img, lang="eng", config="--psm 6 --oem 3")
        return text.strip()
    except Exception as e:
        print(f"[OCR] Local Tesseract fallback error: {e}")
        return ""


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Zero-RAM Multi-Tier Cloud-First OCR Pipeline:
    1. Google Gemini Flash Lite Vision (500 RPD, 0 MB server RAM)
    2. Cloud OCR.space API (Zero-RAM free cloud fallback)
    3. Local Tesseract (Emergency offline fallback)
    """
    if not image_bytes or len(image_bytes) < 100:
        print("[OCR ERROR] Invalid or empty image payload received.")
        return ""

    print(f"\n--- [OCR ENGINE START] Processing image payload ({len(image_bytes)} bytes) ---")
    
    # 1. Tier 1: Google Gemini Flash Lite Vision
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key and gemini_key.strip():
        print("[OCR LOG] Attempting Tier 1: Google Gemini Flash Lite Vision OCR...")
        text = extract_text_with_gemini(image_bytes, gemini_key.strip())
        if text and len(text) > 10:
            clean_text = " ".join(text.replace("\r", " ").replace("\n", " ").split())
            print(f"[OCR LOG SUCCESS] Tier 1 Gemini extracted {len(clean_text)} characters.")
            print(f"[OCR SAMPLE]: '{clean_text[:150]}...'")
            return clean_text
        print("[OCR LOG WARNING] Tier 1 Gemini returned empty or failed. Falling back to Tier 2...")
    else:
        print("[OCR LOG WARNING] Tier 1 Gemini skipped: GEMINI_API_KEY is not set in environment.")

    # 2. Tier 2: Cloud OCR (OCR.space)
    print("[OCR LOG] Attempting Tier 2: Free Cloud OCR API (OCR.space)...")
    text = extract_text_with_cloud_ocr(image_bytes)
    if text and len(text) > 10:
        clean_text = " ".join(text.replace("\r", " ").replace("\n", " ").split())
        print(f"[OCR LOG SUCCESS] Tier 2 Cloud OCR extracted {len(clean_text)} characters.")
        print(f"[OCR SAMPLE]: '{clean_text[:150]}...'")
        return clean_text
    print("[OCR LOG WARNING] Tier 2 Cloud OCR returned empty or failed. Falling back to Tier 3...")

    # 3. Tier 3: Local Tesseract (Offline Emergency Fallback)
    print("[OCR LOG] Attempting Tier 3: Local Tesseract OCR fallback...")
    text = extract_text_with_local_tesseract(image_bytes)
    if text and len(text) > 10:
        clean_text = " ".join(text.replace("\r", " ").replace("\n", " ").split())
        print(f"[OCR LOG SUCCESS] Tier 3 Local Tesseract extracted {len(clean_text)} characters.")
        return clean_text

    print("[OCR LOG RESULT] All OCR tiers returned 0 characters.")
    return ""