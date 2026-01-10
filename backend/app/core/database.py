"""
Spivot Backend - Database Configuration
"""
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import get_settings


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


settings = get_settings()

# Determine proper database URL
db_url = settings.database_url
if not db_url or db_url == "":
    # Use SQLite for demo/development
    db_url = "sqlite+aiosqlite:///./spivot_demo.db"

# Create async engine
engine = create_async_engine(
    db_url,
    echo=settings.debug,
    future=True
)

# Session factory
async_session_maker = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)


async def get_db() -> AsyncSession:
    """Dependency for getting async database session."""
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
