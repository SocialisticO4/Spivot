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


# Import routers individually to prevent one failure Blocking all
try:
    from app.api.endpoints import dashboard
    app.include_router(dashboard.router)
except Exception as e:
    print(f"❌ Failed to load dashboard router: {e}")

try:
    from app.api.endpoints import documents
    app.include_router(documents.router)
except Exception as e:
    print(f"❌ Failed to load documents router: {e}")

try:
    from app.api.endpoints import inventory
    app.include_router(inventory.router)
except Exception as e:
    print(f"❌ Failed to load inventory router: {e}")

try:
    from app.api.endpoints import cashflow
    app.include_router(cashflow.router)
except Exception as e:
    print(f"❌ Failed to load cashflow router: {e}")

try:
    from app.api.endpoints import agents
    app.include_router(agents.router)
except Exception as e:
    print(f"❌ Failed to load agents router: {e}")

try:
    from app.api.endpoints import demo
    app.include_router(demo.router)
except Exception as e:
    print(f"❌ Failed to load demo router: {e}")

try:
    from app.api.endpoints import forecast
    app.include_router(forecast.router)
except Exception as e:
    print(f"❌ Failed to load forecast router: {e}")
