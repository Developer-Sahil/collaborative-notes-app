from services.note_service import note_service
from models.note import NoteCreate, NoteUpdate
import uuid

def verify_sharing():
    user_id = "test_user_" + str(uuid.uuid4())[:8]
    print(f"Creating note for user {user_id}...")
    
    note_create = NoteCreate(title="Verification Note", content="Test Content")
    note = note_service.create_note(note_create, user_id)
    note_id = note["id"]
    share_token = note["share_token"]
    
    print(f"Note created with ID: {note_id}, Share Token: {share_token}")
    
    # Check if not public at start
    assert note["is_public"] == False
    
    # Try fetching by share token (should fail)
    print("Fetching note by share token (should be None)...")
    fetched = note_service.get_note_by_share_token(share_token)
    assert fetched is None
    print("Correctly returned None for non-public note.")
    
    # Mark as public
    print("Marking note as public...")
    note_service.update_sharing(note_id, True, user_id)
    
    # Try fetching by share token (should succeed)
    print("Fetching note by share token (should succeed)...")
    fetched = note_service.get_note_by_share_token(share_token)
    assert fetched is not None
    assert fetched["id"] == note_id
    assert fetched["is_public"] == True
    print(f"Successfully fetched public note: {fetched['title']}")
    
    # Try fetching by share token with wrong token
    print("Fetching with wrong token (should be None)...")
    fetched = note_service.get_note_by_share_token("wrongtoken")
    assert fetched is None
    print("Correctly returned None for wrong token.")
    
    # Clean up (Optional, but let's delete)
    print("Cleaning up... deleting note.")
    note_service.delete_note(note_id, user_id)
    print("Verification complete!")

if __name__ == "__main__":
    try:
        verify_sharing()
    except Exception as e:
        print(f"Verification failed: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
