"""
The Underwriter Agent - Credit Scoring & Risk Assessment
Generates Spivot Score (300-900) based on financial health.
"""
from typing import Optional
from app.models.pydantic_models import SpivotScore


class UnderwriterAgent:
    """Credit scoring and risk assessment agent."""
    
    # Score weights
    WEIGHT_CASH_CONSISTENCY = 0.4
    WEIGHT_REVENUE_GROWTH = 0.3
    WEIGHT_VENDOR_PAYMENT = 0.3
    
    # Score range
    MIN_SCORE = 300
    MAX_SCORE = 900
    
    def generate_spivot_score(
        self,
        cash_consistency: float,  # 0-100: How consistent is cash flow
        revenue_growth: float,     # Percentage growth (can be negative)
        vendor_payment_history: float  # 0-100: On-time payment percentage
    ) -> SpivotScore:
        """
        Generate Spivot credit score using weighted formula.
        
        Score = (Cash_Consistency * 0.4) + (Revenue_Growth * 0.3) + (Vendor_Payment * 0.3)
        Normalized to 300-900 scale.
        
        Args:
            cash_consistency: Cash flow consistency score (0-100)
            revenue_growth: Revenue growth percentage
            vendor_payment_history: Vendor payment on-time rate (0-100)
            
        Returns:
            SpivotScore with breakdown
        """
        # Normalize inputs to 0-100 scale
        cash_score = max(0, min(100, cash_consistency))
        
        # Convert growth to 0-100 scale (-50% to +50% maps to 0-100)
        growth_normalized = max(0, min(100, (revenue_growth + 50) * 1))
        
        vendor_score = max(0, min(100, vendor_payment_history))
        
        # Calculate weighted score (0-100)
        weighted_raw = (
            cash_score * self.WEIGHT_CASH_CONSISTENCY +
            growth_normalized * self.WEIGHT_REVENUE_GROWTH +
            vendor_score * self.WEIGHT_VENDOR_PAYMENT
        )
        
        # Scale to 300-900
        score = int(self.MIN_SCORE + (weighted_raw / 100) * (self.MAX_SCORE - self.MIN_SCORE))
        score = max(self.MIN_SCORE, min(self.MAX_SCORE, score))
        
        # Determine risk level
        if score >= 750:
            risk_level = "low"
        elif score >= 600:
            risk_level = "medium"
        else:
            risk_level = "high"
        
        return SpivotScore(
            score=score,
            cash_consistency=round(cash_score, 2),
            revenue_growth=round(revenue_growth, 2),
            vendor_payment_history=round(vendor_score, 2),
            risk_level=risk_level
        )
    
    def calculate_from_transactions(
        self,
        transactions: list[dict],
        vendor_payments: Optional[list[dict]] = None
    ) -> SpivotScore:
        """
        Calculate Spivot score from raw transaction data.
        
        Args:
            transactions: List of transaction dicts
            vendor_payments: Optional list of vendor payment records
            
        Returns:
            SpivotScore
        """
        # Calculate cash consistency from transaction variance
        if transactions:
            credits = [t.get("amount", 0) for t in transactions if t.get("type") == "credit"]
            if credits:
                avg_credit = sum(credits) / len(credits)
                variance = sum((c - avg_credit) ** 2 for c in credits) / len(credits)
                std_dev = variance ** 0.5
                # Lower variance = higher consistency
                cash_consistency = max(0, 100 - (std_dev / avg_credit * 100)) if avg_credit > 0 else 50
            else:
                cash_consistency = 50
        else:
            cash_consistency = 50
        
        # Calculate revenue growth (last month vs previous)
        # Simplified: compare recent vs older transactions
        if len(transactions) >= 2:
            mid = len(transactions) // 2
            older_credits = sum(
                t.get("amount", 0) for t in transactions[:mid] if t.get("type") == "credit"
            )
            recent_credits = sum(
                t.get("amount", 0) for t in transactions[mid:] if t.get("type") == "credit"
            )
            if older_credits > 0:
                revenue_growth = ((recent_credits - older_credits) / older_credits) * 100
            else:
                revenue_growth = 0
        else:
            revenue_growth = 0
        
        # Calculate vendor payment history
        if vendor_payments:
            on_time = sum(1 for p in vendor_payments if p.get("on_time", True))
            vendor_payment_history = (on_time / len(vendor_payments)) * 100
        else:
            vendor_payment_history = 80  # Default assumption
        
        return self.generate_spivot_score(
            cash_consistency=cash_consistency,
            revenue_growth=revenue_growth,
            vendor_payment_history=vendor_payment_history
        )
    
    def get_score_interpretation(self, score: int) -> str:
        """Get human-readable interpretation of score."""
        if score >= 800:
            return "Excellent - Premium credit terms available"
        elif score >= 700:
            return "Good - Standard credit terms available"
        elif score >= 600:
            return "Fair - Limited credit options"
        elif score >= 500:
            return "Below Average - Higher rates may apply"
        else:
            return "Poor - Credit improvement needed"


# Singleton instance
underwriter = UnderwriterAgent()
