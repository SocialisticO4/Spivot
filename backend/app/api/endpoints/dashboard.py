"""
API Endpoints - Dashboard Aggregations
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.schemas import User, Inventory, Transaction, AgentLog, TransactionType
from app.models.pydantic_models import DashboardMetrics, CashflowAnalysis
from app.services.agents import treasurer, underwriter


router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get aggregated dashboard metrics."""
    
    # Get user
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get transactions for cashflow analysis
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    # Analyze cashflow
    tx_dicts = [
        {"date": t.date, "amount": t.amount, "type": t.type.value}
        for t in transactions
    ]
    cashflow = treasurer.analyze_cashflow(tx_dicts)
    
    # Calculate Spivot Score
    spivot = underwriter.calculate_from_transactions(tx_dicts)
    
    # Count pending orders (items below reorder level)
    result = await db.execute(
        select(func.count()).select_from(Inventory).where(
            Inventory.user_id == user_id,
            Inventory.qty < Inventory.reorder_level
        )
    )
    pending_orders = result.scalar() or 0
    
    # Get total inventory value
    result = await db.execute(
        select(func.sum(Inventory.qty * Inventory.unit_cost)).where(
            Inventory.user_id == user_id
        )
    )
    inventory_value = result.scalar() or 0
    
    return DashboardMetrics(
        cash_runway_days=cashflow.cash_runway_days,
        spivot_score=spivot.score,
        pending_orders=pending_orders,
        forecast_accuracy=0.87,  # Simulated
        burn_rate=cashflow.burn_rate,
        total_inventory_value=round(inventory_value, 2)
    )


@router.get("/cashflow", response_model=CashflowAnalysis)
async def get_cashflow_analysis(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed cashflow analysis."""
    
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    tx_dicts = [
        {"date": t.date, "amount": t.amount, "type": t.type.value}
        for t in transactions
    ]
    
    return treasurer.analyze_cashflow(tx_dicts)


@router.get("/expense-breakdown")
async def get_expense_breakdown(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get monthly expenses by category."""
    
    result = await db.execute(
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        ).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.DEBIT
        ).group_by(Transaction.category)
    )
    
    breakdown = [
        {"category": row.category, "amount": round(row.total, 2)}
        for row in result.all()
    ]
    
    return {"expenses": breakdown}
