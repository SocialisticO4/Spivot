"""
API Endpoints - Inventory Management
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.schemas import Inventory, AgentLog, AgentSeverity
from app.models.pydantic_models import (
    InventoryCreate, InventoryResponse, InventoryAlert, PurchaseOrderDraft
)
from app.services.agents import quartermaster, prophet
from app.models.schemas import BusinessType


router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.get("/", response_model=list[InventoryResponse])
async def list_inventory(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """List all inventory items."""
    
    result = await db.execute(
        select(Inventory).where(Inventory.user_id == user_id)
    )
    return result.scalars().all()


@router.post("/", response_model=InventoryResponse)
async def create_inventory_item(
    item: InventoryCreate,
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Add a new inventory item."""
    
    inventory = Inventory(user_id=user_id, **item.model_dump())
    db.add(inventory)
    await db.commit()
    await db.refresh(inventory)
    
    return inventory


@router.get("/alerts", response_model=list[InventoryAlert])
async def get_inventory_alerts(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Get items below reorder point (Quartermaster analysis)."""
    
    result = await db.execute(
        select(Inventory).where(Inventory.user_id == user_id)
    )
    items = result.scalars().all()
    
    alerts = []
    for item in items:
        # Simple demand estimate based on current stock and reorder level
        estimated_daily = item.reorder_level / 10
        predicted_demand = estimated_daily * 30
        
        needs_reorder, alert, _ = quartermaster.optimize_inventory(
            current_stock=item.qty,
            lead_time_days=item.lead_time_days,
            predicted_demand=predicted_demand,
            sku=item.sku,
            name=item.name,
            unit=item.unit,
            unit_cost=item.unit_cost
        )
        
        if alert:
            alerts.append(alert)
    
    return alerts


@router.get("/optimize", response_model=list[PurchaseOrderDraft])
async def optimize_inventory(
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
):
    """Run Quartermaster optimization and get suggested purchase orders."""
    
    result = await db.execute(
        select(Inventory).where(Inventory.user_id == user_id)
    )
    items = result.scalars().all()
    
    # Get demand forecast from Prophet
    forecast = prophet.forecast_demand(
        historical_data=[],  # Would use real sales data
        business_type=BusinessType.MANUFACTURING,
        forecast_days=30
    )
    
    total_demand = sum(d.get("value", 0) for d in forecast.predicted_demand)
    
    # Convert to dict for batch optimization
    item_dicts = [
        {
            "sku": i.sku,
            "name": i.name,
            "qty": i.qty,
            "unit": i.unit,
            "lead_time_days": i.lead_time_days,
            "unit_cost": i.unit_cost,
            "reorder_level": i.reorder_level
        }
        for i in items
    ]
    
    # Distribute demand across items (simplified)
    demand_per_item = total_demand / len(items) if items else 0
    demand_forecasts = {i["sku"]: demand_per_item for i in item_dicts}
    
    orders = quartermaster.batch_optimize(item_dicts, demand_forecasts)
    
    # Log the optimization
    if orders:
        log = AgentLog(
            agent_name="Quartermaster",
            action="Inventory optimization completed",
            result=f"Generated {len(orders)} purchase order drafts",
            severity=AgentSeverity.INFO if len(orders) < 3 else AgentSeverity.WARNING
        )
        db.add(log)
        await db.commit()
    
    return orders


@router.get("/{item_id}", response_model=InventoryResponse)
async def get_inventory_item(
    item_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific inventory item."""
    
    item = await db.get(Inventory, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return item
