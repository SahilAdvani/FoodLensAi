from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from database import supabase
import uuid

router = APIRouter()

class CreateSessionRequest(BaseModel):
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
