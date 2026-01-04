from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from services.chat_engine import ChatEngine
from supabase import create_client
import os

router = APIRouter(prefix="/chat", tags=["Chat"])

chat_engine = ChatEngine()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
)


# Schemas
class CreateSessionResponse(BaseModel):
    success: bool
    session_id: str
    title: Optional[str] = None


class ChatMessageRequest(BaseModel):
    session_id: str
    message: str
    user_id: Optional[str] = None


class ChatMessageResponse(BaseModel):
    success: bool
    reply: str
    session_id: str


#  Create / Resume Chat Session
@router.post("/session", response_model=CreateSessionResponse)
def create_or_resume_session(user_id: Optional[str] = None):
    """
    Creates a new chat session OR resumes the latest active one.
    """

    # Try to resume active session
    query = (
        supabase.from_("sessions")
        .select("id, title")
        .eq("mode", "chat")
        .eq("is_active", True)
        .order("updated_at", desc=True)
        .limit(1)
    )

    if user_id:
        query = query.eq("user_id", user_id)

    result = query.execute()

    if result.data:
        session = result.data[0]
        return {
            "success": True,
            "session_id": session["id"],
            "title": session.get("title"),
        }

    # Create new session
    insert = (
        supabase.from_("sessions")
        .insert(
            {
                "user_id": user_id,
                "mode": "chat",
                "title": "New Chat",
            }
        )
        .execute()
    )

    if not insert.data:
        raise HTTPException(status_code=500, detail="Failed to create session")

    session = insert.data[0]

    return {
        "success": True,
        "session_id": session["id"],
        "title": session.get("title"),
    }


# Send Chat Message
@router.post("/message", response_model=ChatMessageResponse)
def send_chat_message(payload: ChatMessageRequest):
    """
    Sends a message to the chat engine (memory + RAG).
    """

    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    response = chat_engine.chat(
        session_id=payload.session_id,
        user_message=payload.message,
        user_id=payload.user_id,
    )

    return response
