"""
Spivot Backend - Core Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # App
    app_name: str = "Spivot API"
    app_env: str = "development"
    debug: bool = True
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./spivot_demo.db"
    supabase_url: str = ""
    supabase_key: str = ""
    
    # Google Gemini
    google_api_key: str = ""
    
    # CORS
    cors_origins: str = "http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
