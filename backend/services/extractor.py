import re
from services.normalizer import normalize_ingredient

COMMON_FOOD_WORDS = [
    "sugar", "salt", "flour", "oil", "milk", "egg", "butter",
    "wheat", "cocoa", "starch", "syrup", "flavour", "flavor",
    "protein", "fat", "carbohydrate", "vitamin", "acid", "water", 
    "corn", "soy", "nut", "fruit", "juice", "extract", "ghee", "masala"
]

def looks_like_ingredients(text: str) -> bool:
    text = text.lower()
    return any(word in text for word in COMMON_FOOD_WORDS)


def clean_item(item: str) -> str:
    item = re.sub(r"\([^)]*\)", "", item)      # remove brackets
    item = re.sub(r"[^a-zA-Z\s]", "", item)    # remove symbols
    item = item.strip()
    return item.title()


def extract_ingredients(text: str) -> list[str]:
    text = text.lower()

    # 1️Try "ingredients" keyword
    match = re.search(r"ingredients[:\-]?(.*)", text)
    if match:
        ingredients_text = match.group(1)
    else:
        # Fallback: treat full text as ingredients if it looks like food
        if not looks_like_ingredients(text):
            return []
        ingredients_text = text

    # Split by commas
    raw_items = re.split(r",|;", ingredients_text)

    cleaned = []
    for item in raw_items:
        item = clean_item(item)
        if len(item) > 2 and len(item) < 40:
            cleaned.append(item)

    cleaned = [normalize_ingredient(i) for i in cleaned]

    # Remove duplicates
    return list(dict.fromkeys(cleaned))
