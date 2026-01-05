import os
import json
from typing import List, Dict

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

KNOWLEDGE_DIR = os.path.join(BASE_DIR, "knowledge")

REQUIRED_FIELDS = {
    "ingredient",
    "role",
    "summary",
    "evidence",
    "sources"
}


def load_knowledge() -> List[Dict]:
    documents = []

    if not os.path.exists(KNOWLEDGE_DIR):
        raise FileNotFoundError(f"Knowledge directory not found: {KNOWLEDGE_DIR}")

    for filename in os.listdir(KNOWLEDGE_DIR):
        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(KNOWLEDGE_DIR, filename)

        try:
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            missing = REQUIRED_FIELDS - data.keys()
            if missing:
                print(f"[WARNING] {filename} missing fields: {missing}")
                continue

            documents.append(data)

        except json.JSONDecodeError:
            print(f"[ERROR] Invalid JSON in {filename}")
        except Exception as e:
            print(f"[ERROR] Failed loading {filename}: {e}")

    print(f"[INFO] Loaded {len(documents)} knowledge documents")
    return documents

