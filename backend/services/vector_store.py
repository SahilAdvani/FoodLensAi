import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict

from services.knowledge_loader import load_knowledge


class VectorStore:
    def __init__(self):
        # Load embedding model
        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        # Load knowledge documents
        self.documents = load_knowledge()

        # Prepare texts for embedding
        self.texts = [
            f"{doc['ingredient']}. Role: {doc['role']}. {doc['summary']}. Evidence: {doc['evidence']}."
            for doc in self.documents
        ]

        # Create embeddings
        embeddings = self.model.encode(self.texts, convert_to_numpy=True)

        # Normalize embeddings (important for cosine similarity)
        faiss.normalize_L2(embeddings)

        # Create FAISS index
        dim = embeddings.shape[1]
        self.index = faiss.IndexFlatIP(dim)
        self.index.add(embeddings)

    def search(self, query: str, top_k: int = 2) -> List[Dict]:
        query_embedding = self.model.encode([query], convert_to_numpy=True)
        faiss.normalize_L2(query_embedding)

        scores, indices = self.index.search(query_embedding, top_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            doc = self.documents[idx]
            results.append({
                "ingredient": doc["ingredient"],
                "role": doc["role"],
                "summary": doc["summary"],
                "evidence": doc["evidence"],
                "confidence_score": float(score)
            })

        return results

