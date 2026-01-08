"""
API Endpoints - Demo Mode & Data Reset
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.mock_data import mock_generator


router = APIRouter(prefix="/demo", tags=["Demo"])


@router.post("/reset")
async def reset_demo_data(
    crisis_mode: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset demo data.
    
    Args:
        crisis_mode: If True, generate crisis scenario (low cash, high demand, low stock)
    """
    # Clear existing data
    await mock_generator.clear_all_data(db)
    
    # Generate fresh demo data
    result = await mock_generator.generate_demo_data(db, crisis_mode=crisis_mode)
    
    return {
        "message": "Demo data reset successfully",
        "mode": "crisis" if crisis_mode else "normal",
        **result
    }


@router.post("/seed")
async def seed_demo_data(
    crisis_mode: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Seed demo data without clearing existing data.
    """
    result = await mock_generator.generate_demo_data(db, crisis_mode=crisis_mode)
    
    return {
        "message": "Demo data seeded",
        **result
    }
