"""
The Treasurer Agent - Liquidity Guardian & Cashflow Analysis
Monitors cash health and alerts on critical situations.
"""
from datetime import datetime, timedelta
from typing import Optional
from app.models.schemas import TransactionType
from app.models.pydantic_models import CashflowAnalysis


class TreasurerAgent:
    """Cashflow analysis and liquidity monitoring agent."""
    
    def __init__(self, critical_runway_days: int = 20):
        """
        Initialize Treasurer with alert thresholds.
        
        Args:
            critical_runway_days: Days threshold for critical alert
        """
        self.critical_runway_days = critical_runway_days
        self.warning_runway_days = 45  # Warning threshold
    
    def analyze_cashflow(
        self,
        transactions: list[dict],
        current_balance: Optional[float] = None
    ) -> CashflowAnalysis:
        """
        Analyze cashflow from transaction history.
        
        Args:
            transactions: List of transaction dicts with date, amount, type
            current_balance: Optional current account balance
            
        Returns:
            CashflowAnalysis with burn rate, runway, and alerts
        """
        if not transactions:
            return CashflowAnalysis(
                burn_rate=0,
                cash_runway_days=999,
                current_balance=current_balance or 0,
                alert_level="normal",
                monthly_inflow=0,
                monthly_outflow=0
            )
        
        # Filter to last 30 days for burn rate calculation
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_transactions = []
        
        for t in transactions:
            t_date = t.get("date")
            if isinstance(t_date, str):
                try:
                    t_date = datetime.fromisoformat(t_date.replace("Z", "+00:00"))
                except:
                    t_date = datetime.now()
            
            if t_date >= thirty_days_ago:
                recent_transactions.append(t)
        
        # Calculate inflows and outflows
        monthly_inflow = 0
        monthly_outflow = 0
        
        for t in recent_transactions:
            amount = abs(t.get("amount", 0))
            t_type = t.get("type", "").lower()
            
            if t_type == "credit" or t_type == TransactionType.CREDIT.value:
                monthly_inflow += amount
            else:
                monthly_outflow += amount
        
        # Calculate burn rate (daily average outflow)
        days_in_period = min(30, len(set(
            t.get("date", datetime.now()).strftime("%Y-%m-%d") 
            if isinstance(t.get("date"), datetime) 
            else str(t.get("date", ""))[:10]
            for t in recent_transactions
        )) or 1)
        
        burn_rate = monthly_outflow / 30  # Daily burn rate
        
        # Calculate current balance if not provided
        if current_balance is None:
            # Estimate from transactions (net flow)
            total_credits = sum(
                abs(t.get("amount", 0)) 
                for t in transactions 
                if t.get("type", "").lower() in ["credit", TransactionType.CREDIT.value]
            )
            total_debits = sum(
                abs(t.get("amount", 0)) 
                for t in transactions 
                if t.get("type", "").lower() in ["debit", TransactionType.DEBIT.value]
            )
            current_balance = total_credits - total_debits
        
        # Calculate cash runway
        if burn_rate > 0:
            cash_runway_days = int(current_balance / burn_rate)
        else:
            cash_runway_days = 999  # No burn = infinite runway
        
        cash_runway_days = max(0, cash_runway_days)  # No negative runway
        
        # Determine alert level
        if cash_runway_days < self.critical_runway_days:
            alert_level = "critical"
        elif cash_runway_days < self.warning_runway_days:
            alert_level = "warning"
        else:
            alert_level = "normal"
        
        return CashflowAnalysis(
            burn_rate=round(burn_rate, 2),
            cash_runway_days=cash_runway_days,
            current_balance=round(current_balance, 2),
            alert_level=alert_level,
            monthly_inflow=round(monthly_inflow, 2),
            monthly_outflow=round(monthly_outflow, 2)
        )
    
    def get_cashflow_summary(self, analysis: CashflowAnalysis) -> str:
        """Generate human-readable cashflow summary."""
        alert_emoji = {
            "critical": "🚨",
            "warning": "⚠️",
            "normal": "✅"
        }
        
        emoji = alert_emoji.get(analysis.alert_level, "")
        
        return (
            f"{emoji} Cash Runway: {analysis.cash_runway_days} days | "
            f"Burn Rate: ₹{analysis.burn_rate:,.0f}/day | "
            f"Balance: ₹{analysis.current_balance:,.0f}"
        )
    
    def project_balance(
        self,
        current_balance: float,
        burn_rate: float,
        days: int
    ) -> list[dict]:
        """Project balance over time."""
        projections = []
        balance = current_balance
        
        for day in range(1, days + 1):
            balance -= burn_rate
            projections.append({
                "day": day,
                "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d"),
                "projected_balance": round(max(0, balance), 2)
            })
        
        return projections


# Singleton instance
treasurer = TreasurerAgent()
