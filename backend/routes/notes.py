from fastapi import APIRouter, Depends, HTTPException, status
from models.note import NoteCreate, NoteUpdate, NoteResponse, NoteListResponse
from services.note_service import note_service
from core.security import get_current_user

import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteCreate, current_user: dict = Depends(get_current_user)):
    """Create a new note"""
    try:
        result = note_service.create_note(note, current_user["uid"])
        return NoteResponse(**result)
    except Exception as e:
        logger.exception("Failed to create note")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create note: {str(e)}",
        )


@router.get("", response_model=NoteListResponse)
async def get_notes(current_user: dict = Depends(get_current_user)):
    """Get all notes for current user"""
    try:
        notes = note_service.get_user_notes(current_user["uid"])
        return NoteListResponse(notes=notes, total=len(notes))
    except Exception as e:
        logger.exception("Failed to fetch notes")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notes: {str(e)}",
        )


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific note"""
    note = note_service.get_note(note_id, current_user["uid"])
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or access denied",
        )
    
    return NoteResponse(**note)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    update: NoteUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a note"""
    note = note_service.update_note(note_id, update, current_user["uid"])
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or access denied",
        )
    
    return NoteResponse(**note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a note"""
    deleted = note_service.delete_note(note_id, current_user["uid"])
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or you don't have permission to delete",
        )
    
    return None


@router.post("/{note_id}/collaborators/{collaborator_uid}")
async def add_collaborator(
    note_id: str,
    collaborator_uid: str,
    current_user: dict = Depends(get_current_user),
):
    """Add a collaborator to a note"""
    note = note_service.add_collaborator(note_id, collaborator_uid, current_user["uid"])
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found or access denied",
        )
    
    return NoteResponse(**note)