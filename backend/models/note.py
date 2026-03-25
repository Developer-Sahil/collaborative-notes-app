from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = ""
    is_public: bool = False
    share_token: Optional[str] = None
    expires_at: Optional[datetime] = None


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None


class ShareUpdate(BaseModel):
    is_public: Optional[bool] = None
    collaborators: Optional[List[str]] = None
    permissions: Optional[dict] = None # UID -> role
    expires_at: Optional[datetime] = None


class NoteResponse(NoteBase):
    id: str
    created_by: str
    collaborators: List[str]
    permissions: dict = {} # Map of UID to "owner", "editor", "viewer"
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    notes: List[NoteResponse]
    total: int