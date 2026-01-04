NORMALIZATION_MAP = {
    "sait": "Salt",
    "fron": "Iron",
    "lee niacin": "Niacin",
    "butter oil a": "Butter Oil",
    "fatrecuced": "Fat Reduced",
    "nergy": "Energy",
}

STOPWORDS = [
    "typical", "value", "nutrition", "energy", "protein"
]


def normalize_ingredient(name: str) -> str:
    n = name.lower()

    for k, v in NORMALIZATION_MAP.items():
        if k in n:
            return v

    for sw in STOPWORDS:
        n = n.replace(sw, "")

    return n.strip().title()
