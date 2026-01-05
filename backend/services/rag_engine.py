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

    def explain_ingredients_batch(self, ingredients: List[str], language: str = "en") -> Dict:
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

        lang_instruction = ""
        if "hi" in language.lower():
            lang_instruction = "IMPORTANT: Write the 'explanation' and 'role' field values in Hindi/Hinglish. Keep the 'ingredient' name in English or transliterated Hindi. Keep JSON keys standard English."

        prompt = f"""
You are a food safety assistant.

CRITICAL RULES:
- Use ONLY the information provided below
- DO NOT add outside knowledge
- DO NOT merge ingredients
- Explain EACH ingredient SEPARATELY
- If evidence is mixed, state that clearly
- Explain in simple words for a layperson. Avoid technical jargon.
- Focus on awareness: Is it Good/Bad? Why?
- Keep tone calm and consumer-friendly
- {lang_instruction}

RETURN STRICT JSON ONLY in this format:

{{
  "results": [
    {{
      "ingredient": "<name>",
      "role": "<role>",
      "evidence": "<evidence>",
      "explanation": "<short explanation in simple words>"
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

    def chat_completion(self, history: List[Dict], query: str) -> str:
        """
        Handle chat queries with history context.
        """
        # 1. Retrieve Knowledge based on current query
        # We search specifically for the LAST user query to get relevant ingredients/facts
        context_docs = self.vector_store.search(query, top_k=3)
        
        knowledge_text = "\n".join(
            f"- {doc['ingredient']} ({doc['role']}): {doc['summary']}"
            for doc in context_docs
        )

        # 2. Format History
        # history is expected to be [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
        # We take the last 5 turns to keep context window manageable
        recent_history = history[-5:]
        history_text = ""
        for msg in recent_history:
            role = "User" if msg["role"] == "user" else "Assistant"
            history_text += f"{role}: {msg['content']}\n"

        # 3. Construct Prompt
        prompt = f"""
You are FoodLens AI, a helpful nutrition assistant using simple words.

KNOWLEDGE BASE (Scientific Facts):
{knowledge_text}

CONVERSATION HISTORY:
{history_text}

CURRENT QUESTION: {query}

INSTRUCTIONS:
- Answer the user's question using the KNOWLEDGE BASE.
- Explain complex terms in very simple words (like explaining to a non-expert).
- Focus on awareness/health impact.
- Use CONVERSATION HISTORY to understand context (e.g., if user says "is it safe?", look at what we discussed previously).
- If the answer isn't in the knowledge base, use general food safety knowledge but mention it's general advice.
- Keep answers concise and helpful.
- END WITH A SUGGESTION: "Do you want to know more about [related ingredient]?" or similar.
"""

        response = self.client.chat.completions.create(
            model="openai/gpt-4.1",
            messages=[
                {"role": "system", "content": "You are a helpful nutrition assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3, # Slightly higher for more natural conversation
            timeout=30,
        )

        return response.choices[0].message.content.strip()

    def generate_title(self, text: str) -> str:
        """
        Generate a short title for the chat session based on the first message.
        """
        prompt = f"""
        Generate a short, concise title (max 5 words) for a chat that starts with: "{text}".
        Do not use quotes. Just the title.
        Examples:
        - "Apple Nutrition Info"
        - "Is E102 Safe?"
        - "Banana Calories"
        """

        try:
            response = self.client.chat.completions.create(
                model="openai/gpt-4.1",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant. Keep it brief."},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.5,
                max_tokens=15,
                timeout=10,
            )
            return response.choices[0].message.content.strip().replace('"', '')
        except Exception as e:
            print(f"Title generation failed: {e}")
            return "Chat Session"
