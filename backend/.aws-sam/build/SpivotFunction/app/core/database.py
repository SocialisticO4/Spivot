"""
Database Configuration Module
Handles connection to PostgreSQL (Supabase) and SQLite fallback.
"""
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings
import os

settings = get_settings()

# Get Database URL
DATABASE_URL = settings.database_url or os.getenv("DATABASE_URL", "")

# Fix Postgres URL for asyncpg
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and "+asyncpg" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Fallback to SQLite if no URL
if not DATABASE_URL:
    print("⚠️ No DATABASE_URL found. Using SQLite fallback.")
    DATABASE_URL = "sqlite+aiosqlite:///./spivot_demo.db"

# Create Engine
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,
    # SQLite-specific args
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

class Base(DeclarativeBase):
    pass

async def get_db():
    """Dependency for getting database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables."""
    print(f"🔧 Initializing database... (URL: {DATABASE_URL[:20]}... )")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            print("✅ Tables initialized.")
    except Exception as e:
        print(f"❌ Database init failed: {e}")
        # In Lambda, we might not want to crash if DB is unreachable, 
        # but for initial setup it's good to know.
        raise e
