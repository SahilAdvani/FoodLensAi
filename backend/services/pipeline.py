from services.ocr import extract_text_from_image
from services.extractor import extract_ingredients
from services.rag_engine import rag_engine

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
        self.rag = rag_engine

    def analyze_image(self, image_bytes: bytes, language: str = "en", user_prompt: str = None):
        """
        Optimized & confidence-driven pipeline:
        Image → OCR → Ingredient extraction → Confidence ranking → Batched RAG
        """
        print("\n=================== [PIPELINE STARTED] ===================")
        print(f"[PIPELINE STEP 1/5] Received image ({len(image_bytes)} bytes), language='{language}', prompt='{user_prompt}'")

        # Step 1: OCR
        print("[PIPELINE STEP 1/5] Executing Tesseract OCR on image variants...")
        raw_text = extract_text_from_image(image_bytes)

        if not raw_text or not raw_text.strip():
            print("[PIPELINE ERROR] Step 1 OCR Failed: No text extracted from image!")
            print("=================== [PIPELINE ENDED: FAILED] ===================\n")
            return {
                "success": False,
                "error": "No text detected in image"
            }

        print(f"[PIPELINE STEP 1/5 SUCCESS] OCR extracted {len(raw_text)} chars of text.")
        print(f"[PIPELINE OCR SAMPLE]: '{raw_text[:200]}...'")

        # Step 2: Ingredient extraction
        print("[PIPELINE STEP 2/5] Extracting ingredients via Groq AI / Regex Fallback...")
        ingredients = extract_ingredients(raw_text)

        if not ingredients:
            print("[PIPELINE WARNING] Step 2 Extractor returned 0 ingredients!")
            print("=================== [PIPELINE ENDED: NO INGREDIENTS] ===================\n")
            return {
                "success": True,
                "ingredients": [],
                "message": "No recognizable ingredients found"
            }

        print(f"[PIPELINE STEP 2/5 SUCCESS] Extracted ingredients list: {ingredients}")

        # Step 3: Normalize + filter noise
        cleaned = [
            ing for ing in ingredients
            if ing.lower() not in SKIP_WORDS
        ]

        if not cleaned:
            print("[PIPELINE WARNING] Step 3 Noise Filter dropped all ingredients!")
            print("=================== [PIPELINE ENDED: FILTERED OUT] ===================\n")
            return {
                "success": True,
                "ingredients": [],
                "message": "No relevant ingredients after filtering"
            }

        print(f"[PIPELINE STEP 3/5 SUCCESS] Cleaned ingredients list: {cleaned}")

        # Step 4: Confidence scoring using vector store (BATCHED)
        print("[PIPELINE STEP 4/5] Scoring ingredients against Vector Knowledge DB...")
        try:
            scored_ingredients = []
            results = self.rag.retrieve_context_batch(cleaned, top_k=1)
            
            for item in results:
                scored_ingredients.append({
                    "ingredient": item["ingredient"],
                    "score": item["similarity_score"]
                })
            print(f"[PIPELINE STEP 4/5 SUCCESS] Vector scored results: {scored_ingredients}")
        except Exception as e:
            print(f"[PIPELINE WARNING] Batch vector scoring failed: {e}")
            scored_ingredients = []

        if not scored_ingredients:
            selected_ingredients = cleaned[:MAX_INGREDIENTS]
            print(f"[PIPELINE STEP 4/5 FALLBACK] Using raw extracted ingredients directly: {selected_ingredients}")
        else:
            scored_ingredients.sort(key=lambda x: x["score"], reverse=True)
            selected_ingredients = [
                item["ingredient"]
                for item in scored_ingredients[:MAX_INGREDIENTS]
            ]
            print(f"[PIPELINE STEP 4/5 RESULT] Selected top ingredients: {selected_ingredients}")

        # Step 5: Batched RAG explanation (SINGLE call)
        print(f"[PIPELINE STEP 5/5] Calling Groq LLM RAG explanation for {len(selected_ingredients)} ingredients...")
        try:
            analysis = self.rag.explain_ingredients_batch(selected_ingredients, language=language, user_prompt=user_prompt)
            print("[PIPELINE STEP 5/5 SUCCESS] LLM Analysis generated successfully.")
            print("=================== [PIPELINE COMPLETED SUCCESSFULLY] ===================\n")
        except Exception as e:
            import traceback
            traceback.print_exc()
            print(f"[PIPELINE CRITICAL ERROR] Step 5 RAG LLM Call Failed: {e}")
            print("=================== [PIPELINE ENDED: CRITICAL ERROR] ===================\n")
            return {
                "success": False,
                "error": f"Analysis failed: {str(e)}",
                "ingredients": selected_ingredients
            }

        # Final response
        return {
            "success": True,
            "raw_text": raw_text,
            "ingredients_detected": selected_ingredients,
            "analysis": analysis
        }
