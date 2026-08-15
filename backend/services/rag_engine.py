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

        # Use Groq API key or fallback to GITHUB_TOKEN_FINE if using custom endpoint
        api_key = os.getenv("GROQ_API_KEY") or os.getenv("GITHUB_TOKEN_FINE")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY or GITHUB_TOKEN_FINE is not set")
            
        base_url = os.getenv("GROQ_BASE_URL") # Allow custom endpoints if specified
        
        self.client = OpenAI(
            base_url=base_url if base_url else None,
            api_key=api_key,
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

    def retrieve_context_batch(self, ingredients: List[str], top_k: int = 1) -> List[Dict]:
        """
        Batch retrieve context for multiple ingredients.
        Returns a flat list of best matches for scoring.
        """
        batch_results = self.vector_store.search_batch(ingredients, top_k=top_k)
        
        flat_results = []
        for i, results in enumerate(batch_results):
            if results:
                # Take the top match for each ingredient
                doc = results[0]
                flat_results.append({
                    "ingredient": ingredients[i], # Use original name
                    "role": doc["role"],
                    "evidence": doc["evidence"],
                    "similarity_score": round(doc["confidence_score"], 2)
                })
        return flat_results

    def explain_ingredients_batch(self, ingredients: List[str], language: str = "en", user_prompt: str = None) -> Dict:
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
        if "hi" in language.lower() or "hindi" in language.lower():
            lang_instruction = "IMPORTANT: Write all explanations and the summary in clear Hindi (Devanagari script) mixed with common English terms (Hinglish style) for natural conversation. Keep ingredient names in English."

        prompt_instruction = ""
        if user_prompt:
            prompt_instruction = f"- Focus your summary and ingredient analysis specifically on answering the user's question: '{user_prompt}'."

        prompt = f"""
You are FoodLens AI, a friendly and simple human nutritionist. 

Analyze the ingredients in the CONTEXT below.

CRITICAL RULES:
- Use ONLY the information provided in the CONTEXT. Do not invent facts.
- **VERDICT FIRST**: The very first sentence of your "Quick Summary" MUST be an explicit, bolded verdict telling the user whether it is safe, caution-worthy, or unsafe for them to eat (e.g., "**VERDICT: 🔴 Avoid this product as it is unsafe for regular consumption.**" or "**VERDICT: 🟢 Safe to consume in moderation.**").
- **COMMON MAN LANGUAGE**: Keep all text simple, friendly, and extremely brief. 
- **ONE-SENTENCE EXPLANATIONS**: For each ingredient, give a single, super short explanation (maximum 10-15 words!) explaining why it is Safe/Caution/Avoid in plain layman words.
  * Bad example: "Maltodextrin is a starch-derived carbohydrate powder used as a bulking agent with high glycemic index that raises blood sugar."
  * Good example: "Bad because it causes rapid blood sugar spikes, especially for diabetics."
- DO NOT use headers like 'Role:', 'Evidence:', or 'Explanation:'. Just state the brief explanation directly in plain text.
- {lang_instruction}
- {prompt_instruction}

Format your response in structured Markdown EXACTLY as follows:

## 🥗 Quick Summary
[Bolded Verdict first. Followed by a friendly, 1-2 sentence overall summary answering the user's question if provided.]

---

## 🔍 Ingredient Breakdown
* **[Ingredient Name]** — [🟢 Safe / 🟡 Caution / 🔴 Avoid]: [A single, super short layman sentence (max 12 words) explaining why it is safe, caution-worthy, or should be avoided.]

*(Repeat the bullet point for each detected ingredient)*

CONTEXT:
{full_context}
"""

        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a friendly human nutritionist who explains ingredients clearly in simple Markdown bullet points."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            timeout=30,
        )

        content = response.choices[0].message.content.strip()
        return content

    def chat_completion(self, history: List[Dict], query: str, language: str = "en-US") -> str:
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

        lang_instruction = "Write your entire response in English."
        if language and ("hi" in language.lower() or "hindi" in language.lower()):
            lang_instruction = "IMPORTANT: Write your response in clear Hindi (Devanagari script) mixed with common English terms (Hinglish style) for natural conversation. Keep ingredient names in English."

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
- Use CONVERSATION HISTORY to understand context.
- If the answer isn't in the knowledge base, use general food safety knowledge but mention it's general advice.
- Keep answers concise and helpful.
- **LANGUAGE REQUIREMENT**: {lang_instruction}
- END WITH A SUGGESTION.
"""

        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
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
                model="llama-3.1-8b-instant",
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

# Single shared instance to prevent multiple SentenceTransformer model loads in memory
rag_engine = RAGEngine()
