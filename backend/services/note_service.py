from core.firebase import firebase_manager
from models.note import NoteCreate, NoteUpdate
from datetime import datetime, timezone
from typing import Optional, List
import uuid
from fastapi import HTTPException
from firebase_admin import firestore


class NoteService:
    def __init__(self):
        self.db = firebase_manager.get_db()
        self.collection = "notes"
    
    def create_note(self, note: NoteCreate, user_id: str) -> dict:
        """Create a new note"""
        note_id = str(uuid.uuid4())
        share_token = str(uuid.uuid4()).replace("-", "")[:12]
        
        note_data = {
            "id": note_id,
            "title": note.title,
            "content": note.content or "",
            "created_by": user_id,
            "collaborators": [user_id],
            "permissions": {user_id: "owner"},
            "is_public": False,
            "share_token": share_token,
            "expires_at": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        
        self.db.collection(self.collection).document(note_id).set(note_data)
        return note_data
    
    def get_note(self, note_id: str, user_id: str) -> Optional[dict]:
        """Fetch a single note with access check"""
        doc = self.db.collection(self.collection).document(note_id).get()
        
        if not doc.exists:
            return None
        
        note = doc.to_dict()
        
        # Check if user has access (collaborator or public)
        if user_id not in note.get("collaborators", []) and not note.get("is_public", False):
            return None
        
        # ISO format the dates for response
        note["created_at"] = note["created_at"].isoformat()
        note["updated_at"] = note["updated_at"].isoformat()
        
        return note
    
    def get_user_notes(self, user_id: str) -> List[dict]:
        """Get all notes for a user"""
        docs = self.db.collection(self.collection).where(
            "collaborators", "array_contains", user_id
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
    
    def update_sharing(self, note_id: str, is_public: bool, user_id: str) -> Optional[dict]:
        """Update public sharing status"""
        note_ref = self.db.collection(self.collection).document(note_id)
        doc = note_ref.get()
        
        if not doc.exists:
            return None
        
        note = doc.to_dict()
        if note.get("created_by") != user_id:
            return None
            
        note_ref.update({"is_public": is_public, "updated_at": datetime.utcnow()})
        return self.get_note(note_id, user_id)

    def add_collaborator_by_email(self, note_id: str, email: str, user_id: str) -> dict:
        """Add a collaborator to a note using their email"""
        # Resolve email to UID using Firebase Admin
        try:
            email = email.strip()
            target_user = firebase_manager.auth.get_user_by_email(email)
            collaborator_uid = target_user.uid
        except Exception as e:
            import logging
            import traceback
            logging.error(f"FAILED to resolve collaborator email {email}: {str(e)}")
            logging.error(traceback.format_exc())
            raise HTTPException(
                status_code=404,
                detail=f"User with email {email} not found. They must sign up first."
            )
            
        note_ref = self.db.collection(self.collection).document(note_id)
        
        @firestore.transactional
        def update_in_transaction(transaction, note_reference):
            snapshot = note_reference.get(transaction=transaction)
            if not snapshot.exists:
                raise HTTPException(status_code=404, detail="Note not found")
            
            note = snapshot.to_dict()
            # Only owner or editors can add collaborators
            if note.get("permissions", {}).get(user_id) not in ["owner", "editor"]:
                raise HTTPException(status_code=403, detail="You don't have permission to add collaborators")
            
            collaborators = note.get("collaborators", [])
            permissions = note.get("permissions", {})
            
            if collaborator_uid not in collaborators:
                collaborators.append(collaborator_uid)
                permissions[collaborator_uid] = "editor"
                
                transaction.update(note_reference, {
                    "collaborators": collaborators,
                    "permissions": permissions,
                    "updated_at": datetime.now(timezone.utc)
                })
        
        transaction = self.db.transaction()
        update_in_transaction(transaction, note_ref)
        
        return self.get_note(note_id, user_id)

    def get_note_by_share_token(self, token: str) -> Optional[dict]:
        """Fetch a public note using its share token"""
        docs = self.db.collection(self.collection).where(
            "share_token", "==", token
        ).where("is_public", "==", True).limit(1).stream()
        
        for doc in docs:
            note = doc.to_dict()
            
            expires_at = note.get("expires_at")
            if expires_at and expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
                return None
                
            # ISO format the dates for response
            if note.get("created_at"):
                note["created_at"] = note["created_at"].isoformat() if hasattr(note["created_at"], "isoformat") else note["created_at"]
            if note.get("updated_at"):
                note["updated_at"] = note["updated_at"].isoformat() if hasattr(note["updated_at"], "isoformat") else note["updated_at"]
            if expires_at:
                note["expires_at"] = expires_at.isoformat() if hasattr(expires_at, "isoformat") else expires_at
            return note
            
        return None


# Singleton instance
note_service = NoteService()