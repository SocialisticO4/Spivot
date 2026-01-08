"""
API Endpoints - Demand Forecasting
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.schemas import Transaction, User, TransactionType
from app.models.pydantic_models import DemandForecast
from app.services.agents import prophet


router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get("/demand", response_model=DemandForecast)
async def get_demand_forecast(
    user_id: int = 1,
    days: int = 30,
    db: AsyncSession = Depends(get_db)
):
    """Get Prophet demand forecast."""
    
    # Get user's business type
    user = await db.get(User, user_id)
    if not user:
        from app.models.schemas import BusinessType
        business_type = BusinessType.MANUFACTURING
    else:
        business_type = user.business_type
    
    # Get historical credit transactions as proxy for sales/demand
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.CREDIT
        )
        .order_by(Transaction.date)
    )
    transactions = result.scalars().all()
    
    # Convert to historical data format
    historical_data = [
        {"date": t.date.strftime("%Y-%m-%d"), "value": t.amount}
        for t in transactions
    ]
    
    return prophet.forecast_demand(
        historical_data=historical_data,
        business_type=business_type,
        forecast_days=days
    )


@router.get("/summary")
async def get_forecast_summary(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get human-readable forecast summary."""
    
    user = await db.get(User, user_id)
    if not user:
        from app.models.schemas import BusinessType
        business_type = BusinessType.MANUFACTURING
    else:
        business_type = user.business_type
    
    forecast = prophet.forecast_demand(
        historical_data=[],
        business_type=business_type
    )
    
    return {
        "summary": prophet.get_forecast_summary(forecast),
        "forecast": forecast
    }
