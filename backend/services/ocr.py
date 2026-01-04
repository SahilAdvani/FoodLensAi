import pytesseract
from PIL import Image
import io


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Extract text from an image using Tesseract OCR.
    Returns cleaned text (safe for NLP).
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("L")  # grayscale

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
