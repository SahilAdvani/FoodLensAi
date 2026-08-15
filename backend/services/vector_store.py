import difflib
from typing import List, Dict
from services.knowledge_loader import load_knowledge

def get_similarity(s1: str, s2: str) -> float:
    s1_clean = s1.lower().strip()
    s2_clean = s2.lower().strip()
    # Direct substring checks (e.g. "Sugar" in "Added Sugar")
    if s1_clean in s2_clean or s2_clean in s1_clean:
        return 0.95 + 0.05 * (min(len(s1_clean), len(s2_clean)) / max(len(s1_clean), len(s2_clean)))
    # Fuzzy match ratio fallback
    return difflib.SequenceMatcher(None, s1_clean, s2_clean).ratio()

class VectorStore:
    def __init__(self):
        # Load knowledge documents
        self.documents = load_knowledge()
        print(f"[INFO] Loaded {len(self.documents)} knowledge documents for lightweight matcher.")

    def search(self, query: str, top_k: int = 2) -> List[Dict]:
        return self.search_batch([query], top_k)[0]

    def search_batch(self, queries: List[str], top_k: int = 2) -> List[List[Dict]]:
        if not queries:
            return []

        all_results = []
        for q in queries:
            query_results = []
            for doc in self.documents:
                # Compute similarity between query and document ingredient name
                score = get_similarity(q, doc["ingredient"])
                if score >= 0.35: # Keep reasonable matches
                    query_results.append({
                        "ingredient": doc["ingredient"],
                        "role": doc["role"],
                        "summary": doc["summary"],
                        "evidence": doc["evidence"],
                        "confidence_score": float(score)
                    })
            
            # Sort by score descending
            query_results.sort(key=lambda x: x["confidence_score"], reverse=True)
            all_results.append(query_results[:top_k])

        return all_results

# Global Instance
vector_store = VectorStore()
