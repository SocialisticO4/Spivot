"""
Spivot Backend - Pydantic Request/Response Models
"""
from datetime import datetime
from typing import Optional, Any
from pydantic import BaseModel, EmailStr
from app.models.schemas import BusinessType, TransactionType, DocumentStatus, AgentSeverity


# ============== User Models ==============
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    business_name: str
    business_type: BusinessType = BusinessType.RETAIL


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    business_name: str
    business_type: BusinessType
    created_at: datetime

    class Config:
        from_attributes = True


# ============== Inventory Models ==============
class InventoryCreate(BaseModel):
    sku: str
    name: str
    qty: float = 0
    unit: str = "units"
    reorder_level: float = 0
    lead_time_days: int = 7
    unit_cost: float = 0


class InventoryResponse(BaseModel):
    id: int
    user_id: int
    sku: str
    name: str
    qty: float
    unit: str
    reorder_level: float
    lead_time_days: int
    unit_cost: float
    last_updated: datetime

    class Config:
        from_attributes = True


class InventoryAlert(BaseModel):
    """Inventory reorder alert from Quartermaster."""
    sku: str
    name: str
    current_qty: float
    reorder_point: float
    suggested_order_qty: float
    urgency: str  # low, medium, high


# ============== Transaction Models ==============
class TransactionCreate(BaseModel):
    date: datetime
    amount: float
    type: TransactionType
    category: str = "uncategorized"
    description: Optional[str] = None


class TransactionResponse(BaseModel):
    id: int
    user_id: int
    date: datetime
    amount: float
    type: TransactionType
    category: str
    description: Optional[str]

    class Config:
        from_attributes = True


# ============== Document Models ==============
class DocumentResponse(BaseModel):
    id: int
    user_id: int
    file_url: str
    file_name: str
    document_type: Optional[str]
    extracted_json: Optional[dict]
    status: DocumentStatus
    created_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ExtractedDocumentData(BaseModel):
    """Extracted data from Visual Eye OCR."""
    document_type: str  # Invoice, PO, Bank Statement
    vendor_name: Optional[str] = None
    date: Optional[str] = None
    line_items: list[dict] = []
    total_amount: Optional[float] = None
    tax: Optional[float] = None
    raw_text: Optional[str] = None


# ============== Agent Log Models ==============
class AgentLogResponse(BaseModel):
    id: int
    timestamp: datetime
    agent_name: str
    action: str
    result: Optional[str]
    severity: AgentSeverity
    extra_data: Optional[dict]

    class Config:
        from_attributes = True


# ============== Dashboard Models ==============
class DashboardMetrics(BaseModel):
    """Aggregated dashboard metrics."""
    cash_runway_days: int
    spivot_score: int
    pending_orders: int
    forecast_accuracy: float
    burn_rate: float
    total_inventory_value: float


class CashflowAnalysis(BaseModel):
    """Treasurer cashflow analysis result."""
    burn_rate: float  # Daily average spending
    cash_runway_days: int
    current_balance: float
    alert_level: str  # normal, warning, critical
    monthly_inflow: float
    monthly_outflow: float


class DemandForecast(BaseModel):
    """Prophet demand forecast result."""
    forecast_period_days: int
    predicted_demand: list[dict]  # [{date, value}]
    market_sentiment: float  # 0.8 - 1.2
    confidence: float


class SpivotScore(BaseModel):
    """Underwriter credit score result."""
    score: int  # 300-900
    cash_consistency: float
    revenue_growth: float
    vendor_payment_history: float
    risk_level: str  # low, medium, high


class PurchaseOrderDraft(BaseModel):
    """Quartermaster suggested purchase order."""
    sku: str
    item_name: str
    quantity: float
    unit: str
    estimated_cost: float
    suggested_vendor: Optional[str] = None
    urgency: str
