from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Firebase
    FIREBASE_PROJECT_ID: str
    FIREBASE_PRIVATE_KEY: str
    FIREBASE_CLIENT_EMAIL: str
    
    # API
    API_TITLE: str = "Collaborative Notes API"
    API_VERSION: str = "0.1.0"
    DEBUG: bool = False
    ALLOWED_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # WebSocket
    YJS_SERVER_URL: str = "ws://localhost:1234"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()