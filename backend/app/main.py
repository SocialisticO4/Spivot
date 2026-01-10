"""
Spivot Backend - FastAPI Main Entry Point
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print("🚀 Starting Spivot Backend...")
    
    # Try to initialize database, but don't fail if it doesn't work
    try:
        from app.core.database import init_db
        await init_db()
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database connection failed: {e}")
        print("📝 Running in DEMO MODE (no database)")
    
    yield
    
    # Shutdown
    print("👋 Shutting down Spivot Backend...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="Agentic Operating System for MSMEs - Backend API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Spivot API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


# Import routers after app is created to avoid circular imports
try:
    from app.api.endpoints import dashboard, documents, inventory, cashflow, agents, demo, forecast
    app.include_router(dashboard.router)
    app.include_router(documents.router)
    app.include_router(inventory.router)
    app.include_router(cashflow.router)
    app.include_router(agents.router)
    app.include_router(demo.router)
    app.include_router(forecast.router)
except Exception as e:
    print(f"⚠️ Could not load all routers: {e}")
