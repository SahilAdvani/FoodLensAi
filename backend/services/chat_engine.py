import os
from typing import List, Dict, Optional

from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

from services.vector_store import VectorStore

load_dotenv()


class ChatEngine:
    """
    Stateful RAG-powered chat engine using:
    - Supabase (PostgreSQL + pgvector) for memory
    - Local VectorStore for food knowledge grounding
    """

    def __init__(self):
        # Supabase
        self.supabase: Client = create_client(
            os.getenv("SUPABASE_URL"),
            os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        )

        # LLM
        self.client = OpenAI(
            api_key=os.getenv("GITHUB_TOKEN_FINE"),
            base_url="https://models.github.ai/inference",
        )

        # Knowledge base
        self.knowledge_store = VectorStore()

    # Embeddings
    def _embed_text(self, text: str) -> List[float]:
        response = self.client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return response.data[0].embedding

    # Message persistence
    def _store_message(
        self,
        session_id: str,
        user_id: Optional[str],
        role: str,
        content: str,
        source: Optional[str] = None,
    ):
        embedding = self._embed_text(content)

        self.supabase.from_("messages").insert(
            {
                "session_id": session_id,
                "user_id": user_id,
                "role": role,
                "content": content,
                "embedding": embedding,
                "source": source,
            }
        ).execute()

    # Memory retrieval
    def _get_recent_messages(
        self, session_id: str, limit: int = 6
    ) -> List[Dict]:
        response = (
            self.supabase.from_("messages")
            .select("role, content")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return list(reversed(response.data or []))

    def _get_similar_past_messages(
        self, query_embedding: List[float], session_id: str, limit: int = 4
    ) -> List[Dict]:
        """
        Uses pgvector similarity search inside Supabase
        (requires a SQL RPC or view on your side)
        """
        response = self.supabase.rpc(
            "match_messages",
            {
                "query_embedding": query_embedding,
                "match_threshold": 0.78,
                "match_count": limit,
                "session_id": session_id,
            },
        ).execute()

        return response.data or []

    # Knowledge base retrieval
    def _retrieve_knowledge(self, text: str) -> str:
        docs = self.knowledge_store.search(text, top_k=4)

        sections = []
        for d in docs:
            sections.append(
                f"""
Ingredient: {d['ingredient']}
Role: {d['role']}
Evidence: {d['evidence']}
Summary: {d['summary']}
""".strip()
            )

        return "\n\n---\n\n".join(sections)

    # Main chat method
    def chat(
        self,
        session_id: str,
        user_message: str,
        user_id: Optional[str] = None,
    ) -> Dict:
        # Store user message
        self._store_message(
            session_id=session_id,
            user_id=user_id,
            role="user",
            content=user_message,
        )

        # Build memories
        query_embedding = self._embed_text(user_message)

        recent_messages = self._get_recent_messages(session_id)
        past_similar = self._get_similar_past_messages(
            query_embedding, session_id
        )
        knowledge_context = self._retrieve_knowledge(user_message)

        # Prompt
        prompt = f"""
You are a food safety assistant chatbot.

CRITICAL RULES:
- Use ONLY the knowledge provided below
- Do NOT add outside facts
- Be clear if evidence is mixed
- Keep responses short, calm, and consumer-friendly

RECENT CONVERSATION:
{recent_messages}

RELATED PAST DISCUSSION:
{past_similar}

KNOWLEDGE BASE:
{knowledge_context}

USER QUESTION:
{user_message}
"""

        response = self.client.chat.completions.create(
            model="openai/gpt-4.1",
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict, grounded food safety assistant.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            timeout=30,
        )

        assistant_reply = response.choices[0].message.content.strip()

        # Store assistant message
        self._store_message(
            session_id=session_id,
            user_id=user_id,
            role="assistant",
            content=assistant_reply,
            source="rag",
        )

        return {
            "success": True,
            "reply": assistant_reply,
            "session_id": session_id,
        }
