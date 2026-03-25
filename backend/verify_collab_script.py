from services.note_service import note_service
from models.note import NoteCreate
import uuid

def verify_collaboration():
    owner_id = "owner_" + str(uuid.uuid4())[:8]
    editor_id = "editor_" + str(uuid.uuid4())[:8]
    
    print(f"Creating note for owner {owner_id}...")
    note_create = NoteCreate(title="Collab Note", content="Initial")
    note = note_service.create_note(note_create, owner_id)
    note_id = note["id"]
    
    # Check editor access (should be None)
    print(f"Checking editor access for {editor_id} (should be None)...")
    fetched = note_service.get_note(note_id, editor_id)
    assert fetched is None
    print("Correctly denied access to non-collaborator.")
    
    # Force add collaborator (simulating add_collaborator_by_email logic but with UID directly since we don't have real users)
    print(f"Manually adding {editor_id} as editor...")
    note_ref = note_service.db.collection(note_service.collection).document(note_id)
    collaborators = [owner_id, editor_id]
    permissions = {owner_id: "owner", editor_id: "editor"}
    note_ref.update({"collaborators": collaborators, "permissions": permissions})
    
    # Check editor access (should be OK)
    print(f"Checking editor access for {editor_id} (should be success)...")
    fetched = note_service.get_note(note_id, editor_id)
    assert fetched is not None
    assert fetched["id"] == note_id
    assert editor_id in fetched["collaborators"]
    print(f"Success! Editor {editor_id} can now access the note.")
    
    # Try updating note as editor
    print("Updating note as editor...")
    from models.note import NoteUpdate
    update = NoteUpdate(content="Updated by editor")
    updated = note_service.update_note(note_id, update, editor_id)
    assert updated is not None
    assert updated["content"] == "Updated by editor"
    print("Success! Editor can update the note.")
    
    # Try deleting as editor (should fail)
    print("Trying to delete as editor (should fail)...")
    deleted = note_service.delete_note(note_id, editor_id)
    assert deleted == False
    print("Correctly prevented editor from deleting note.")
    
    # Try deleting as owner
    print("Deleting as owner...")
    deleted = note_service.delete_note(note_id, owner_id)
    assert deleted == True
    print("Successfully deleted note as owner.")
    
    print("Collaboration verification complete!")

if __name__ == "__main__":
    try:
        verify_collaboration()
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
