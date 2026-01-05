from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional, List
from database import supabase
import uuid
from services.rag_engine import RAGEngine

router = APIRouter()
rag = RAGEngine()

class CreateSessionRequest(BaseModel):
    user_id: Optional[str] = None
    mode: str = "live" # 'live' or 'chat'

class DeleteSessionsRequest(BaseModel):
    session_ids: List[str]
    user_id: str

@router.delete("/sessions")
async def delete_sessions(request: DeleteSessionsRequest):
    """
    Bulk delete sessions.
    """
    try:
        # Delete sessions matching IDs and User ID (security)
        response = supabase.table("sessions")\
            .delete()\
            .in_("id", request.session_ids)\
            .eq("user_id", request.user_id)\
            .execute()
            
        return {"success": True, "count": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/sessions/{session_id}/title")
async def update_session_title(session_id: str, text: str = Body(..., embed=True)):
    """
    Generate and update title for a session based on user text.
    """
    try:
        title = rag.generate_title(text)
        
        # Update session in Supabase
        # Note: 'title' column must exist in 'sessions' table
        try:
             supabase.table("sessions")\
                .update({"title": title})\
                .eq("id", session_id)\
                .execute()
        except:
             # If column missing, ignore
             pass

        return {"title": title}
    except Exception as e:
        print(f"Failed to update title: {e}")
        return {"title": "Chat Session"}
    user_id: Optional[str] = None
    mode: str = "live" # 'live' or 'chat'

@router.post("/session")
async def create_session(request: CreateSessionRequest):
    try:
        session_data = {
            "mode": request.mode,
            "is_active": True
        }
        if request.user_id:
            session_data["user_id"] = request.user_id

        data = supabase.table("sessions").insert(session_data).execute()
        
        # Check if data.data is not empty
        if not data.data:
             raise HTTPException(status_code=500, detail="Failed to create session")

        return {"session_id": data.data[0]["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{user_id}")
async def get_user_sessions(user_id: str):
    """
    Get all chat sessions for a user.
    """
    try:
        response = supabase.table("sessions")\
            .select("*")\
            .eq("user_id", user_id)\
            .eq("mode", "chat")\
            .order("created_at", desc=True)\
            .execute()
        
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
