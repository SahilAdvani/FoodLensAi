import re
import json
from services.normalizer import normalize_ingredient
from services.rag_engine import rag_engine

COMMON_FOOD_WORDS = [
    "sugar", "salt", "flour", "oil", "milk", "egg", "butter",
    "wheat", "cocoa", "starch", "syrup", "flavour", "flavor",
    "protein", "fat", "carbohydrate", "vitamin", "acid", "water", 
    "corn", "soy", "nut", "fruit", "juice", "extract", "ghee", "masala"
]

NUTRITION_CLUTTER_TERMS = {
    "energy", "kcal", "protein", "carbohydrate", "carbohydrates", "total sugars", "added sugars",
    "fat", "saturated fat", "trans fat", "sodium", "cholesterol", "dietary fiber", "fibre",
    "daily value", "rda", "per 100g", "per serving", "product of", "ready-to-eat", "savouries",
    "proprietary food", "indian snacks", "as seasoning agent", "servings per", "license no", "fssai"
}

def is_nutrition_clutter(item: str) -> bool:
    item_lower = item.lower().strip()
    return any(clutter in item_lower for clutter in NUTRITION_CLUTTER_TERMS)

def looks_like_ingredients(text: str) -> bool:
    text = text.lower()
    return any(word in text for word in COMMON_FOOD_WORDS)

def clean_item(item: str) -> str:
    item = re.sub(r"\([^)]*\)", "", item)      # remove brackets
    item = re.sub(r"[^a-zA-Z\s]", "", item)    # remove symbols
    item = item.strip()
    return item.title()

def extract_ingredients_regex(text: str) -> list[str]:
    """
    Regex fallback extractor for fast local parsing.
    """
    text_lower = text.lower()

    # Try matching "ingredients" or "contains" keyword
    match = re.search(r"(?:ingredients|contains|made with)[:\-]?(.*)", text_lower)
    if match:
        ingredients_text = match.group(1)
    else:
        # If no explicit header, use full text if it contains food words
        if not looks_like_ingredients(text_lower):
            return []
        ingredients_text = text_lower

    # Split by commas, semicolons, or newlines
    raw_items = re.split(r"[,;\n\.]", ingredients_text)

    cleaned = []
    for item in raw_items:
        c = clean_item(item)
        if len(c) > 2 and len(c) < 40 and not is_nutrition_clutter(c):
            if looks_like_ingredients(c.lower()):
                cleaned.append(c)

    cleaned = [normalize_ingredient(i) for i in cleaned]
    return list(dict.fromkeys(cleaned))

def extract_ingredients(text: str) -> list[str]:
    """
    AI-Powered Smart Ingredient Extractor:
    Uses LLM intelligence (Groq groq/compound-mini) to isolate actual ingredients from
    cluttered OCR text (stripping nutrition tables, addresses, disclaimers) and fixing OCR typos.
    Falls back to regex parsing if AI is unavailable.
    """
    if not text or not text.strip():
        return []

    # 1. Try AI-powered Extraction
    try:
        prompt = f"""
You are an expert food label OCR parser.
Below is raw text extracted from a food package label via OCR.

RAW TEXT:
\"\"\"
{text[:2000]}
\"\"\"

TASK:
1. Identify and extract ONLY the food ingredient names from the text.
2. IGNORE all Nutrition Facts tables (calories, fat grams, daily values), manufacturer addresses, disclaimers, slogans, net weight, and barcodes.
3. Correct minor OCR typos (e.g., 'Sug4r' -> 'Sugar', 'P4lm O1l' -> 'Palm Oil', '1ngred1ents' -> 'Ingredients').
4. Return ONLY a valid JSON array of ingredient strings. No explanation, no markdown formatting.

Example Output format:
["Refined Wheat Flour", "Sugar", "Palm Oil", "Salt"]
"""
        response = rag_engine.client.chat.completions.create(
            model="groq/compound-mini",
            messages=[
                {"role": "system", "content": "You are a precise JSON food ingredient parser. Return ONLY a JSON array of string names."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=250,
            timeout=10
        )

        content = response.choices[0].message.content.strip()

        # Clean JSON fences if present
        if content.startswith("```"):
            content = re.sub(r"^```(?:json)?|```$", "", content, flags=re.MULTILINE).strip()

        parsed = json.loads(content)
        if isinstance(parsed, list) and len(parsed) > 0:
            cleaned_ai = []
            for item in parsed:
                if isinstance(item, str) and not is_nutrition_clutter(item):
                    c = clean_item(item)
                    if len(c) > 2 and len(c) < 40 and not is_nutrition_clutter(c):
                        cleaned_ai.append(normalize_ingredient(c))
            
            cleaned_ai = list(dict.fromkeys(cleaned_ai))
            if cleaned_ai:
                return cleaned_ai

    except Exception as e:
        print(f"[EXTRACTOR] AI extraction fallback to regex due to: {e}")

    # 2. Fallback to Regex Extractor if AI is unavailable or returns empty
    return extract_ingredients_regex(text)
