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
        self.db = None
        self.auth = None
        
        try:
            # Prefer initializing via a secret file path (recommended for Cloud Run)
            if settings.FIREBASE_AUTH_KEY_PATH:
                import os
                if os.path.exists(settings.FIREBASE_AUTH_KEY_PATH):
                    print(f"Initializing Firebase using file: {settings.FIREBASE_AUTH_KEY_PATH}")
                    cred = credentials.Certificate(settings.FIREBASE_AUTH_KEY_PATH)
                else:
                    print(f"WARNING: Secret file not found at {settings.FIREBASE_AUTH_KEY_PATH}. Falling back to env vars.")
                    cred = self._get_env_credentials()
            else:
                cred = self._get_env_credentials()
                
            if cred:
                firebase_admin.initialize_app(cred)
                self.db = firestore.client()
                self.auth = firebase_auth
                print("Firebase successfully initialized!")
            else:
                print("ERROR: No Firebase credentials provided. The database will be unavailable.")
        except Exception as e:
            print(f"CRITICAL: Firebase initialization error: {e}")
            # We don't raise here to allow the app to start and serve a health check
            # This helps debug from the Cloud Console logs.

    def _get_env_credentials(self) -> Optional[credentials.Certificate]:
        """Helper to get credentials from individual environment variables"""
        if not all([settings.FIREBASE_PROJECT_ID, settings.FIREBASE_PRIVATE_KEY, settings.FIREBASE_CLIENT_EMAIL]):
            return None
            
        try:
            cred_dict = {
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n").replace('"', ''),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            return credentials.Certificate(cred_dict)
        except Exception as e:
            print(f"Error parsing environment credentials: {e}")
            return None
    
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