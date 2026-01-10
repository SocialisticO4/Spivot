"""
API Endpoints - Cashflow & Transactions
"""
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.schemas import Transaction, User
from app.models.pydantic_models import (
    TransactionCreate, TransactionResponse, CashflowAnalysis, SpivotScore
)
from app.services.agents import treasurer, underwriter


router = APIRouter(prefix="/cashflow", tags=["Cashflow"])


@router.get("/transactions", response_model=list[TransactionResponse])
async def list_transactions(
    user_id: int = 1,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all transactions for a user."""
    
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.post("/transactions", response_model=TransactionResponse)
async def create_transaction(
    tx: TransactionCreate,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Record a new transaction."""
    
    transaction = Transaction(user_id=user_id, **tx.model_dump())
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    
    return transaction


@router.get("/analysis", response_model=CashflowAnalysis)
async def analyze_cashflow(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get Treasurer cashflow analysis."""
    
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    tx_dicts = [
        {"date": t.date, "amount": t.amount, "type": t.type.value}
        for t in transactions
    ]
    
    return treasurer.analyze_cashflow(tx_dicts)


@router.get("/score", response_model=SpivotScore)
async def get_spivot_score(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get Underwriter credit score (Spivot Score)."""
    
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    tx_dicts = [
        {"date": t.date, "amount": t.amount, "type": t.type.value}
        for t in transactions
    ]
    
    return underwriter.calculate_from_transactions(tx_dicts)


@router.get("/projection")
async def project_balance(
    days: int = 30,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Project cash balance over time."""
    
    result = await db.execute(
        select(Transaction).where(Transaction.user_id == user_id)
    )
    transactions = result.scalars().all()
    
    tx_dicts = [
        {"date": t.date, "amount": t.amount, "type": t.type.value}
        for t in transactions
    ]
    
    analysis = treasurer.analyze_cashflow(tx_dicts)
    projections = treasurer.project_balance(
        current_balance=analysis.current_balance,
        burn_rate=analysis.burn_rate,
        days=days
    )
    
    return {"projections": projections}
