"""
Spivot Backend - SQLAlchemy Database Models
"""
from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import String, Integer, Float, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class BusinessType(str, Enum):
    """MSME Business Type Categories."""
    MANUFACTURING = "manufacturing"
    SERVICE = "service"
    TRADING = "trading"
    RETAIL = "retail"


class TransactionType(str, Enum):
    """Transaction types."""
    DEBIT = "debit"
    CREDIT = "credit"


class DocumentStatus(str, Enum):
    """Document processing status."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentSeverity(str, Enum):
    """Agent log severity levels."""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class User(Base):
    """MSME User/Business Profile."""
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    business_type: Mapped[BusinessType] = mapped_column(
        SQLEnum(BusinessType), default=BusinessType.RETAIL
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    inventory_items: Mapped[list["Inventory"]] = relationship(back_populates="user")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="user")
    documents: Mapped[list["Document"]] = relationship(back_populates="user")


class Inventory(Base):
    """Inventory/Stock Items."""
    __tablename__ = "inventory"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    sku: Mapped[str] = mapped_column(String(100), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    qty: Mapped[float] = mapped_column(Float, default=0)
    unit: Mapped[str] = mapped_column(String(50), default="units")
    reorder_level: Mapped[float] = mapped_column(Float, default=0)
    lead_time_days: Mapped[int] = mapped_column(Integer, default=7)
    unit_cost: Mapped[float] = mapped_column(Float, default=0)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="inventory_items")


class Transaction(Base):
    """Financial Transactions (Bank Statement entries)."""
    __tablename__ = "transactions"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    type: Mapped[TransactionType] = mapped_column(SQLEnum(TransactionType), nullable=False)
    category: Mapped[str] = mapped_column(String(100), default="uncategorized")
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="transactions")


class Document(Base):
    """Uploaded Documents (Invoices, POs, Bank Statements)."""
    __tablename__ = "documents"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    file_url: Mapped[str] = mapped_column(Text, nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    extracted_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[DocumentStatus] = mapped_column(
        SQLEnum(DocumentStatus), default=DocumentStatus.PENDING
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    # Relationships
    user: Mapped["User"] = relationship(back_populates="documents")


class AgentLog(Base):
    """Agent Activity Logs."""
    __tablename__ = "agent_logs"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    agent_name: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    result: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[AgentSeverity] = mapped_column(
        SQLEnum(AgentSeverity), default=AgentSeverity.INFO
    )
    metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
