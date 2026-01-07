from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from database import supabase
from services.rag_engine import RAGEngine

router = APIRouter()
rag = RAGEngine()

class ChatMessage(BaseModel):
    session_id: str
    message: str
    user_id: Optional[str] = None

@router.post("/message")
async def chat_message(data: ChatMessage):
    """
    Handle a user message: save it, get AI response with history, save AI response.
    """
    try:
        # 1. Save User Message
        user_msg = {
            "session_id": data.session_id,
            "role": "user",
            "content": data.message,
            "source": "chat_input"
        }
        if data.user_id:
            user_msg["user_id"] = data.user_id

        supabase.table("messages").insert(user_msg).execute()

        # 2. Fetch History (last 10 messages for context)  
        history_response = supabase.table("messages")\
            .select("role, content")\
            .eq("session_id", data.session_id)\
            .order("created_at", desc=True)\
            .limit(10)\
            .execute()

        # Convert to list and reverse to get chronological order [oldest ... newest]
        history = history_response.data[::-1] if history_response.data else []

        # 3. Generate AI Response
        ai_response_text = rag.chat_completion(history, data.message)

        # 4. Save AI Message
        ai_msg = {
            "session_id": data.session_id,
            "role": "assistant",
            "content": ai_response_text,
            "source": "chat_response"
        }
        if data.user_id:
            ai_msg["user_id"] = data.user_id

        supabase.table("messages").insert(ai_msg).execute()

        return {
            "role": "assistant",
            "content": ai_response_text
        }

    except Exception as e:
        print(f"Chat Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Retrieve full chat history for a session.
    """
    try:
        response = supabase.table("messages")\
            .select("*")\
            .eq("session_id", session_id)\
            .order("created_at", desc=False)\
            .execute()

        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
