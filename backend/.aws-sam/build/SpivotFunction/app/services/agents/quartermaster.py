"""
The Quartermaster Agent - Supply Chain & Inventory Optimization
Manages reorder points and generates draft purchase orders.
"""
from typing import Optional
from app.models.pydantic_models import InventoryAlert, PurchaseOrderDraft


class QuartermasterAgent:
    """Inventory optimization and supply chain management agent."""
    
    def __init__(self, safety_stock_days: int = 3):
        """
        Initialize Quartermaster with safety stock configuration.
        
        Args:
            safety_stock_days: Days of safety stock to maintain
        """
        self.safety_stock_days = safety_stock_days
    
    def calculate_reorder_point(
        self,
        daily_usage: float,
        lead_time_days: int
    ) -> float:
        """
        Calculate reorder point using the formula:
        Reorder Point = (Daily_Usage * Lead_Time) + Safety_Stock
        
        Args:
            daily_usage: Average daily consumption
            lead_time_days: Supplier lead time in days
            
        Returns:
            Reorder point quantity
        """
        safety_stock = daily_usage * self.safety_stock_days
        reorder_point = (daily_usage * lead_time_days) + safety_stock
        return round(reorder_point, 2)
    
    def optimize_inventory(
        self,
        current_stock: float,
        lead_time_days: int,
        predicted_demand: float,  # Total demand for forecast period
        forecast_days: int = 30,
        sku: str = "",
        name: str = "",
        unit: str = "units",
        unit_cost: float = 0
    ) -> tuple[bool, Optional[InventoryAlert], Optional[PurchaseOrderDraft]]:
        """
        Optimize inventory and generate alerts/orders if needed.
        
        Args:
            current_stock: Current inventory quantity
            lead_time_days: Supplier lead time in days
            predicted_demand: Predicted demand for the forecast period
            forecast_days: Number of days in forecast
            sku: Stock keeping unit identifier
            name: Item name
            unit: Unit of measurement
            unit_cost: Cost per unit
            
        Returns:
            Tuple of (needs_reorder, alert, purchase_order)
        """
        # Calculate daily usage from predicted demand
        daily_usage = predicted_demand / forecast_days if forecast_days > 0 else 0
        
        # Calculate reorder point
        reorder_point = self.calculate_reorder_point(daily_usage, lead_time_days)
        
        # Check if reorder is needed
        needs_reorder = current_stock < reorder_point
        
        if not needs_reorder:
            return False, None, None
        
        # Calculate order quantity (enough for lead time + safety + buffer)
        days_to_cover = lead_time_days + self.safety_stock_days + 7  # Extra week buffer
        order_qty = (daily_usage * days_to_cover) - current_stock
        order_qty = max(order_qty, daily_usage * 7)  # Minimum 1 week order
        
        # Determine urgency
        days_of_stock = current_stock / daily_usage if daily_usage > 0 else float('inf')
        if days_of_stock < 3:
            urgency = "high"
        elif days_of_stock < 7:
            urgency = "medium"
        else:
            urgency = "low"
        
        # Create alert
        alert = InventoryAlert(
            sku=sku,
            name=name,
            current_qty=current_stock,
            reorder_point=reorder_point,
            suggested_order_qty=round(order_qty, 2),
            urgency=urgency
        )
        
        # Create draft purchase order
        purchase_order = PurchaseOrderDraft(
            sku=sku,
            item_name=name,
            quantity=round(order_qty, 2),
            unit=unit,
            estimated_cost=round(order_qty * unit_cost, 2),
            urgency=urgency
        )
        
        return True, alert, purchase_order
    
    def batch_optimize(
        self,
        inventory_items: list[dict],
        demand_forecasts: dict[str, float]  # sku -> predicted_demand
    ) -> list[PurchaseOrderDraft]:
        """
        Batch optimize multiple inventory items.
        
        Args:
            inventory_items: List of inventory item dicts
            demand_forecasts: Dict mapping SKU to predicted demand
            
        Returns:
            List of draft purchase orders for items needing reorder
        """
        orders = []
        
        for item in inventory_items:
            sku = item.get("sku", "")
            predicted_demand = demand_forecasts.get(sku, item.get("qty", 0) * 0.5)
            
            needs_reorder, alert, order = self.optimize_inventory(
                current_stock=item.get("qty", 0),
                lead_time_days=item.get("lead_time_days", 7),
                predicted_demand=predicted_demand,
                forecast_days=30,
                sku=sku,
                name=item.get("name", ""),
                unit=item.get("unit", "units"),
                unit_cost=item.get("unit_cost", 0)
            )
            
            if order:
                orders.append(order)
        
        return orders


# Singleton instance
quartermaster = QuartermasterAgent()
