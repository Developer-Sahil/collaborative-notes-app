from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = ""


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class NoteResponse(NoteBase):
    id: str
    created_by: str
    collaborators: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    notes: List[NoteResponse]
    total: int