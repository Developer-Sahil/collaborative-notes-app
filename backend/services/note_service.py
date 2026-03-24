from core.firebase import firebase_manager
from models.note import NoteCreate, NoteUpdate
from datetime import datetime
from typing import Optional, List
import uuid


class NoteService:
    def __init__(self):
        self.db = firebase_manager.get_db()
        self.collection = "notes"
    
    def create_note(self, note: NoteCreate, user_id: str) -> dict:
        """Create a new note"""
        note_id = str(uuid.uuid4())
        
        note_data = {
            "id": note_id,
            "title": note.title,
            "content": note.content or "",
            "created_by": user_id,
            "collaborators": [user_id],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        
        self.db.collection(self.collection).document(note_id).set(note_data)
        return note_data
    
    def get_note(self, note_id: str, user_id: str) -> Optional[dict]:
        """Fetch a single note with access check"""
        doc = self.db.collection(self.collection).document(note_id).get()
        
        if not doc.exists:
            return None
        
        note = doc.to_dict()
        
        # Check if user has access
        if user_id not in note.get("collaborators", []):
            return None
        
        # Convert timestamps to ISO format for JSON serialization
        note["created_at"] = note["created_at"].isoformat()
        note["updated_at"] = note["updated_at"].isoformat()
        
        return note
    
    def get_user_notes(self, user_id: str) -> List[dict]:
        """Get all notes for a user"""
        docs = self.db.collection(self.collection).where(
            "collaborators", "array-contains", user_id
        ).stream()
        
        notes = []
        for doc in docs:
            note = doc.to_dict()
            note["created_at"] = note["created_at"].isoformat()
            note["updated_at"] = note["updated_at"].isoformat()
            notes.append(note)
        
        return sorted(notes, key=lambda x: x["updated_at"], reverse=True)
    
    def update_note(self, note_id: str, update: NoteUpdate, user_id: str) -> Optional[dict]:
        """Update note content and title"""
        note_ref = self.db.collection(self.collection).document(note_id)
        doc = note_ref.get()
        
        if not doc.exists:
            return None
        
        note = doc.to_dict()
        if user_id not in note.get("collaborators", []):
            return None
        
        update_data = {
            "updated_at": datetime.utcnow(),
        }
        
        if update.title is not None:
            update_data["title"] = update.title
        if update.content is not None:
            update_data["content"] = update.content
        
        note_ref.update(update_data)
        
        updated_doc = note_ref.get()
        result = updated_doc.to_dict()
        result["created_at"] = result["created_at"].isoformat()
        result["updated_at"] = result["updated_at"].isoformat()
        return result
    
    def delete_note(self, note_id: str, user_id: str) -> bool:
        """Delete a note (only creator can delete)"""
        doc = self.db.collection(self.collection).document(note_id).get()
        
        if not doc.exists:
            return False
        
        note = doc.to_dict()
        if note.get("created_by") != user_id:
            return False
        
        self.db.collection(self.collection).document(note_id).delete()
        return True
    
    def add_collaborator(self, note_id: str, collaborator_uid: str, user_id: str) -> Optional[dict]:
        """Add a collaborator to a note"""
        note_ref = self.db.collection(self.collection).document(note_id)
        doc = note_ref.get()
        
        if not doc.exists:
            return None
        
        note = doc.to_dict()
        if user_id not in note.get("collaborators", []):
            return None
        
        if collaborator_uid not in note.get("collaborators", []):
            note_ref.update({
                "collaborators": note.get("collaborators", []) + [collaborator_uid]
            })
        
        updated_doc = note_ref.get()
        result = updated_doc.to_dict()
        result["created_at"] = result["created_at"].isoformat()
        result["updated_at"] = result["updated_at"].isoformat()
        return result


# Singleton instance
note_service = NoteService()