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
        return self.search_batch([query], top_k)[0]        

    def search_batch(self, queries: List[str], top_k: int = 2) -> List[List[Dict]]:
        if not queries:
            return []

        # encode batch
        query_embeddings = self.model.encode(queries, convert_to_numpy=True)
        faiss.normalize_L2(query_embeddings)

        # search batch
        # D: distances (scores), I: indices
        scores, indices = self.index.search(query_embeddings, top_k)

        all_results = []
        for i in range(len(queries)):
            query_results = []
            for score, idx in zip(scores[i], indices[i]):  
                if idx == -1: continue # Should not happen with IndexFlatIP unless empty
                doc = self.documents[idx]
                query_results.append({
                    "ingredient": doc["ingredient"],       
                    "role": doc["role"],
                    "summary": doc["summary"],
                    "evidence": doc["evidence"],
                    "confidence_score": float(score)       
                })
            all_results.append(query_results)

        return all_results

