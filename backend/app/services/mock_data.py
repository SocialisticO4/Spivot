"""
Mock Data Generator for Spivot Demo
Generates realistic data for a fictitious Auto Parts Manufacturer.
"""
import random
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import (
    User, Inventory, Transaction, Document, AgentLog,
    BusinessType, TransactionType, DocumentStatus, AgentSeverity
)


class MockDataGenerator:
    """Generates realistic mock data for demo purposes."""
    
    # Auto Parts Manufacturer inventory items
    INVENTORY_ITEMS = [
        {"sku": "STL-001", "name": "Steel Sheets (1mm)", "unit": "kg", "unit_cost": 85},
        {"sku": "STL-002", "name": "Steel Rods (10mm)", "unit": "kg", "unit_cost": 92},
        {"sku": "ALU-001", "name": "Aluminum Plates", "unit": "kg", "unit_cost": 210},
        {"sku": "RUB-001", "name": "Rubber Gaskets", "unit": "pieces", "unit_cost": 12},
        {"sku": "BRK-001", "name": "Brake Pads (Set)", "unit": "sets", "unit_cost": 450},
        {"sku": "OIL-001", "name": "Hydraulic Oil", "unit": "liters", "unit_cost": 180},
        {"sku": "BRG-001", "name": "Ball Bearings (50mm)", "unit": "pieces", "unit_cost": 320},
        {"sku": "SPR-001", "name": "Suspension Springs", "unit": "pieces", "unit_cost": 780},
        {"sku": "FLT-001", "name": "Air Filters", "unit": "pieces", "unit_cost": 95},
        {"sku": "WHL-001", "name": "Wheel Hubs", "unit": "pieces", "unit_cost": 1250},
    ]
    
    # Transaction categories
    EXPENSE_CATEGORIES = [
        "Raw Materials", "Utilities", "Salaries", "Rent", "Equipment",
        "Marketing", "Logistics", "Maintenance", "Insurance", "Taxes"
    ]
    
    INCOME_CATEGORIES = [
        "Product Sales", "Service Revenue", "Advance Payment", "Refund Received"
    ]
    
    async def generate_demo_data(
        self,
        db: AsyncSession,
        crisis_mode: bool = False
    ) -> dict:
        """
        Generate complete demo dataset.
        
        Args:
            db: Database session
            crisis_mode: If True, generate crisis scenario (low cash, high demand)
            
        Returns:
            Dict with generated record counts
        """
        # Create demo user
        user = await self._create_demo_user(db)
        
        # Generate inventory
        inventory_count = await self._generate_inventory(db, user.id, crisis_mode)
        
        # Generate transactions
        transaction_count = await self._generate_transactions(db, user.id, crisis_mode)
        
        # Generate agent logs
        logs_count = await self._generate_agent_logs(db, crisis_mode)
        
        await db.commit()
        
        return {
            "user_id": user.id,
            "inventory_items": inventory_count,
            "transactions": transaction_count,
            "agent_logs": logs_count,
            "mode": "crisis" if crisis_mode else "normal"
        }
    
    async def _create_demo_user(self, db: AsyncSession) -> User:
        """Create the demo user (Auto Parts Manufacturer)."""
        user = User(
            email="demo@spivotauto.com",
            name="Rajesh Kumar",
            business_name="Spivot Auto Parts Pvt. Ltd.",
            business_type=BusinessType.MANUFACTURING
        )
        db.add(user)
        await db.flush()
        return user
    
    async def _generate_inventory(
        self,
        db: AsyncSession,
        user_id: int,
        crisis_mode: bool
    ) -> int:
        """Generate inventory items."""
        count = 0
        
        for item in self.INVENTORY_ITEMS:
            # In crisis mode: low stock
            if crisis_mode:
                qty = random.uniform(10, 50)
                reorder_level = random.uniform(80, 120)
            else:
                qty = random.uniform(100, 500)
                reorder_level = random.uniform(50, 100)
            
            inventory = Inventory(
                user_id=user_id,
                sku=item["sku"],
                name=item["name"],
                qty=round(qty, 2),
                unit=item["unit"],
                reorder_level=round(reorder_level, 2),
                lead_time_days=random.randint(5, 15),
                unit_cost=item["unit_cost"]
            )
            db.add(inventory)
            count += 1
        
        return count
    
    async def _generate_transactions(
        self,
        db: AsyncSession,
        user_id: int,
        crisis_mode: bool
    ) -> int:
        """Generate 90 days of transaction history."""
        count = 0
        base_date = datetime.now() - timedelta(days=90)
        
        for day_offset in range(90):
            current_date = base_date + timedelta(days=day_offset)
            
            # Generate 2-5 transactions per day
            num_transactions = random.randint(2, 5)
            
            for _ in range(num_transactions):
                # Bias towards expenses in crisis mode
                if crisis_mode:
                    is_credit = random.random() < 0.3  # 30% income
                else:
                    is_credit = random.random() < 0.45  # 45% income
                
                if is_credit:
                    category = random.choice(self.INCOME_CATEGORIES)
                    amount = random.uniform(10000, 150000)
                    t_type = TransactionType.CREDIT
                else:
                    category = random.choice(self.EXPENSE_CATEGORIES)
                    # Higher expenses in crisis mode
                    if crisis_mode:
                        amount = random.uniform(15000, 80000)
                    else:
                        amount = random.uniform(5000, 50000)
                    t_type = TransactionType.DEBIT
                
                transaction = Transaction(
                    user_id=user_id,
                    date=current_date + timedelta(hours=random.randint(8, 18)),
                    amount=round(amount, 2),
                    type=t_type,
                    category=category,
                    description=f"{category} - Auto generated"
                )
                db.add(transaction)
                count += 1
        
        return count
    
    async def _generate_agent_logs(
        self,
        db: AsyncSession,
        crisis_mode: bool
    ) -> int:
        """Generate recent agent activity logs."""
        count = 0
        agents = ["Visual Eye", "Prophet", "Quartermaster", "Treasurer", "Underwriter"]
        
        # Generate logs for last 7 days
        base_date = datetime.now() - timedelta(days=7)
        
        for day_offset in range(7):
            current_date = base_date + timedelta(days=day_offset)
            
            for agent in agents:
                # Generate 1-3 logs per agent per day
                num_logs = random.randint(1, 3)
                
                for _ in range(num_logs):
                    action, result, severity = self._generate_agent_action(agent, crisis_mode)
                    
                    log = AgentLog(
                        timestamp=current_date + timedelta(
                            hours=random.randint(8, 18),
                            minutes=random.randint(0, 59)
                        ),
                        agent_name=agent,
                        action=action,
                        result=result,
                        severity=severity
                    )
                    db.add(log)
                    count += 1
        
        return count
    
    def _generate_agent_action(
        self,
        agent: str,
        crisis_mode: bool
    ) -> tuple[str, str, AgentSeverity]:
        """Generate agent-specific action log."""
        if agent == "Visual Eye":
            actions = [
                ("Processed invoice from Steel Suppliers Inc.", "Extracted 12 line items", AgentSeverity.INFO),
                ("Processed bank statement", "Identified 45 transactions", AgentSeverity.INFO),
                ("OCR completed for purchase order", "Vendor: Rubber World", AgentSeverity.INFO),
            ]
        elif agent == "Prophet":
            if crisis_mode:
                actions = [
                    ("Demand forecast updated", "High demand spike predicted (↑35%)", AgentSeverity.WARNING),
                    ("Market sentiment analyzed", "Bullish trend detected (1.18)", AgentSeverity.INFO),
                ]
            else:
                actions = [
                    ("Demand forecast updated", "Stable demand predicted", AgentSeverity.INFO),
                    ("Seasonal adjustment applied", "Q4 uplift factor: 1.12", AgentSeverity.INFO),
                ]
        elif agent == "Quartermaster":
            if crisis_mode:
                actions = [
                    ("Stock alert triggered", "Steel Sheets below reorder point", AgentSeverity.CRITICAL),
                    ("Draft PO generated", "Order 500kg Steel Sheets urgently", AgentSeverity.WARNING),
                    ("Multiple items low", "5 SKUs need immediate restock", AgentSeverity.CRITICAL),
                ]
            else:
                actions = [
                    ("Inventory check completed", "All items above safety stock", AgentSeverity.INFO),
                    ("Reorder suggestion", "Consider restocking Rubber Gaskets", AgentSeverity.INFO),
                ]
        elif agent == "Treasurer":
            if crisis_mode:
                actions = [
                    ("Cash runway critical", "Only 15 days of runway left!", AgentSeverity.CRITICAL),
                    ("Burn rate increased", "Daily burn: ₹45,000 (↑20%)", AgentSeverity.WARNING),
                ]
            else:
                actions = [
                    ("Cashflow analyzed", "Healthy runway of 65 days", AgentSeverity.INFO),
                    ("Monthly report", "Net positive cashflow: ₹2.3L", AgentSeverity.INFO),
                ]
        else:  # Underwriter
            if crisis_mode:
                actions = [
                    ("Spivot Score updated", "Score dropped to 580 (Medium Risk)", AgentSeverity.WARNING),
                    ("Credit alert", "Payment history affecting score", AgentSeverity.WARNING),
                ]
            else:
                actions = [
                    ("Spivot Score updated", "Score: 720 (Low Risk)", AgentSeverity.INFO),
                    ("Credit health good", "Eligible for enhanced credit", AgentSeverity.INFO),
                ]
        
        return random.choice(actions)
    
    async def clear_all_data(self, db: AsyncSession) -> dict:
        """Clear all demo data from database."""
        from sqlalchemy import delete
        
        # Delete in order to respect foreign keys
        await db.execute(delete(AgentLog))
        await db.execute(delete(Document))
        await db.execute(delete(Transaction))
        await db.execute(delete(Inventory))
        await db.execute(delete(User))
        await db.commit()
        
        return {"status": "cleared"}


# Singleton instance
mock_generator = MockDataGenerator()
