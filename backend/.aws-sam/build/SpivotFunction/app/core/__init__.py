"""Core module exports."""
from app.core.config import get_settings, Settings

# Lazy imports to avoid database initialization on Lambda cold start
def get_db():
    from app.core.database import get_db as _get_db
    return _get_db()

def init_db():
    from app.core.database import init_db as _init_db
    return _init_db()

def get_base():
    from app.core.database import Base
    return Base

__all__ = ["get_settings", "Settings", "get_db", "init_db", "get_base"]
