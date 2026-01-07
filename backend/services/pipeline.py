from services.ocr import extract_text_from_image
from services.extractor import extract_ingredients
from services.rag_engine import RAGEngine

MAX_INGREDIENTS = 6  # HARD LIMIT for speed + UX

SKIP_WORDS = {
    "flavouring",
    "added flavour",
    "spices",
    "permitted colour",
    "food colour",
}


class FoodAnalysisPipeline:
    def __init__(self):
        self.rag = RAGEngine()

    def analyze_image(self, image_bytes: bytes, language: str = "en"):
        """
        Optimized & confidence-driven pipeline:
        Image → OCR → Ingredient extraction → Confidence ranking → Batched RAG
        """

        # Step 1: OCR
        raw_text = extract_text_from_image(image_bytes)

        if not raw_text or not raw_text.strip():
            return {
                "success": False,
                "error": "No text detected in image"
            }

        # Step 2: Ingredient extraction
        ingredients = extract_ingredients(raw_text)

        if not ingredients:
            return {
                "success": True,
                "ingredients": [],
                "message": "No recognizable ingredients found"
            }

        # Step 3: Normalize + filter noise
        cleaned = [
            ing for ing in ingredients
            if ing.lower() not in SKIP_WORDS
        ]

        if not cleaned:
            return {
                "success": True,
                "ingredients": [],
                "message": "No relevant ingredients after filtering"
            }

        # Step 4: Confidence scoring using vector store
        # Step 4: Confidence scoring using vector store (BATCHED)
        try:
            scored_ingredients = []
            
            # Use top_k=1 for speed in initial filtering
            results = self.rag.retrieve_context_batch(cleaned, top_k=1)
            
            for item in results:
                scored_ingredients.append({
                    "ingredient": item["ingredient"],
                    "score": item["similarity_score"]
                })
        except Exception as e:
            print(f"Batch scoring failed: {e}")
            # Fallback to empty if batch fails
            scored_ingredients = []

        if not scored_ingredients:
            return {
                "success": True,
                "ingredients": [],
                "message": "No ingredients matched knowledge base with confidence"
            }

        # Step 5: Sort by confidence (DESC)
        scored_ingredients.sort(key=lambda x: x["score"], reverse=True)

        # Step 6: Pick top N MOST CONFIDENT
        selected_ingredients = [
            item["ingredient"]
            for item in scored_ingredients[:MAX_INGREDIENTS]
        ]

        # Step 7: Batched RAG explanation (SINGLE call)
        try:
            analysis = self.rag.explain_ingredients_batch(selected_ingredients, language=language)
        except Exception as e:
            return {
                "success": False,
                "error": "Analysis failed or timed out",
                "ingredients": selected_ingredients
            }

        # Step 8: Final response
        return {
            "success": True,
            "raw_text": raw_text,
            "ingredients_detected": selected_ingredients,
            "analysis": analysis
        }
