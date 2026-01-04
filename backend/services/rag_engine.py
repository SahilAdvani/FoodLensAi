import os
from typing import List, Dict

from dotenv import load_dotenv
from openai import OpenAI

from services.vector_store import VectorStore

load_dotenv()


class RAGEngine:
    """
    Retrieval-Augmented Generation engine for food ingredient explanations.
    Enforces STRICT grounding and per-ingredient isolation.
    """

    def __init__(self):
        self.vector_store = VectorStore()

        api_key = os.getenv("GITHUB_TOKEN_FINE")
        if not api_key:
            raise RuntimeError("GITHUB_TOKEN_FINE is not set")

        self.client = OpenAI(
            api_key=api_key,
            base_url="https://models.github.ai/inference",
        )

    def retrieve_context(self, ingredient: str, top_k: int = 3) -> List[Dict]:
        results = self.vector_store.search(ingredient, top_k=top_k)

        return [
            {
                "ingredient": doc["ingredient"],
                "role": doc["role"],
                "summary": doc["summary"],
                "evidence": doc["evidence"],
                "similarity_score": round(doc["confidence_score"], 2),
            }
            for doc in results
        ]

    def explain_ingredients_batch(self, ingredients: List[str]) -> Dict:
        """
        Explain multiple ingredients in ONE call, but with strict separation.
        """

        ingredient_sections = []

        for ingredient in ingredients:
            context_blocks = self.retrieve_context(ingredient)

            context_text = "\n".join(
                f"- Role: {b['role']}\n"
                f"- Evidence: {b['evidence']}\n"
                f"- Summary: {b['summary']}"
                for b in context_blocks
            )

            ingredient_sections.append(
                f"""
### INGREDIENT: {ingredient}
{context_text}
""".strip()
            )

        full_context = "\n\n".join(ingredient_sections)

        prompt = f"""
You are a food safety assistant.

CRITICAL RULES:
- Use ONLY the information provided below
- DO NOT add outside knowledge
- DO NOT merge ingredients
- Explain EACH ingredient SEPARATELY
- If evidence is mixed, state that clearly
- Keep tone calm and consumer-friendly

RETURN STRICT JSON ONLY in this format:

{{
  "results": [
    {{
      "ingredient": "<name>",
      "role": "<role>",
      "evidence": "<evidence>",
      "explanation": "<short explanation>"
    }}
  ]
}}

CONTEXT:
{full_context}
"""

        response = self.client.chat.completions.create(
            model="openai/gpt-4.1",
            messages=[
                {"role": "system", "content": "You are a strict, grounded AI. Obey the rules exactly."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            timeout=30,
        )

        content = response.choices[0].message.content.strip()
        print(f"DEBUG: Raw RAG response:\n{content}")
        return content
