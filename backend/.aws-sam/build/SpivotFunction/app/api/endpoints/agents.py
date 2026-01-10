"""
API Endpoints - Agent Logs & Activity
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.schemas import AgentLog
from app.models.pydantic_models import AgentLogResponse


router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("/logs", response_model=list[AgentLogResponse])
async def get_agent_logs(
    limit: int = 50,
    agent_name: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get recent agent activity logs."""
    
    query = select(AgentLog).order_by(AgentLog.timestamp.desc()).limit(limit)
    
    if agent_name:
        query = query.where(AgentLog.agent_name == agent_name)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/status")
async def get_agents_status():
    """Get status of all agents."""
    
    return {
        "agents": [
            {
                "name": "Visual Eye",
                "status": "active",
                "description": "OCR & Document Ingestion"
            },
            {
                "name": "Prophet",
                "status": "active",
                "description": "Demand Intelligence & Forecasting"
            },
            {
                "name": "Quartermaster",
                "status": "active",
                "description": "Supply Chain & Inventory Optimization"
            },
            {
                "name": "Treasurer",
                "status": "active",
                "description": "Liquidity Guardian & Cashflow Analysis"
            },
            {
                "name": "Underwriter",
                "status": "active",
                "description": "Credit Scoring & Risk Assessment"
            }
        ]
    }
