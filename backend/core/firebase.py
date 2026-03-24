import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from core.config import get_settings
import json
from typing import Optional

settings = get_settings()


class FirebaseManager:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Firebase Admin SDK"""
        try:
            cred_dict = {
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n").replace('"', ''),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            self.db = firestore.client()
        except Exception as e:
            print(f"Firebase initialization error: {e}")
            raise
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verify Firebase ID token"""
        try:
            decoded = firebase_auth.verify_id_token(token)
            return decoded
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    def get_db(self) -> firestore.Client:
        """Get Firestore client"""
        return self.db


# Singleton instance
firebase_manager = FirebaseManager()