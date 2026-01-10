"""
The Prophet Agent - Demand Intelligence & Forecasting
Forecasts demand based on business type and historical data.
"""
import random
from datetime import datetime, timedelta
from typing import Optional
from app.models.schemas import BusinessType
from app.models.pydantic_models import DemandForecast


class ProphetAgent:
    """Demand forecasting agent with market sentiment simulation."""
    
    def forecast_demand(
        self,
        historical_data: list[dict],
        business_type: BusinessType,
        forecast_days: int = 30
    ) -> DemandForecast:
        """
        Forecast demand based on historical data and business type.
        
        Args:
            historical_data: List of {date, value} historical data points
            business_type: Type of business (retail, manufacturing, etc.)
            forecast_days: Number of days to forecast
            
        Returns:
            DemandForecast with predictions and market sentiment
        """
        # Simulate market sentiment (external trends like Census/FMCG data)
        market_sentiment = round(random.uniform(0.8, 1.2), 2)
        
        # Calculate baseline from historical data
        if historical_data:
            avg_value = sum(d.get("value", 0) for d in historical_data) / len(historical_data)
            # Simple trend calculation
            if len(historical_data) >= 2:
                recent_avg = sum(d.get("value", 0) for d in historical_data[-7:]) / min(7, len(historical_data))
                trend = (recent_avg - avg_value) / avg_value if avg_value > 0 else 0
            else:
                trend = 0
        else:
            # Default values for demo
            avg_value = 1000
            trend = 0.02
        
        # Adjust forecast based on business type
        if business_type == BusinessType.RETAIL:
            # Retail: forecast sales volume with seasonal adjustment
            forecast_label = "Sales Volume"
            seasonality = self._get_seasonal_factor()
        elif business_type == BusinessType.MANUFACTURING:
            # Manufacturing: forecast raw material usage
            forecast_label = "Raw Material Usage"
            seasonality = 1.0  # Less seasonal variation
        elif business_type == BusinessType.TRADING:
            # Trading: higher volatility
            forecast_label = "Order Volume"
            seasonality = self._get_seasonal_factor() * random.uniform(0.9, 1.1)
        else:
            # Service: steady demand
            forecast_label = "Service Demand"
            seasonality = 1.0
        
        # Generate forecast
        predicted_demand = []
        base_date = datetime.now()
        
        for day in range(1, forecast_days + 1):
            forecast_date = base_date + timedelta(days=day)
            
            # Apply trend, seasonality, market sentiment, and some randomness
            day_forecast = avg_value * (1 + trend * day / 30) * seasonality * market_sentiment
            day_forecast *= random.uniform(0.95, 1.05)  # Add noise
            
            predicted_demand.append({
                "date": forecast_date.strftime("%Y-%m-%d"),
                "value": round(day_forecast, 2),
                "label": forecast_label
            })
        
        # Calculate confidence based on data quality
        confidence = min(0.95, 0.6 + (len(historical_data) / 100) * 0.3)
        
        return DemandForecast(
            forecast_period_days=forecast_days,
            predicted_demand=predicted_demand,
            market_sentiment=market_sentiment,
            confidence=round(confidence, 2)
        )
    
    def _get_seasonal_factor(self) -> float:
        """Calculate seasonal adjustment factor based on current month."""
        month = datetime.now().month
        # Simple seasonal pattern (Q4 highest, Q1 lowest for retail)
        seasonal_map = {
            1: 0.85, 2: 0.88, 3: 0.92,   # Q1
            4: 0.95, 5: 0.98, 6: 1.0,    # Q2
            7: 0.97, 8: 0.95, 9: 1.02,   # Q3
            10: 1.08, 11: 1.15, 12: 1.20 # Q4 (holiday season)
        }
        return seasonal_map.get(month, 1.0)
    
    def get_forecast_summary(self, forecast: DemandForecast) -> str:
        """Generate a human-readable forecast summary."""
        total = sum(d.get("value", 0) for d in forecast.predicted_demand)
        avg_daily = total / len(forecast.predicted_demand) if forecast.predicted_demand else 0
        
        sentiment_desc = "neutral"
        if forecast.market_sentiment > 1.1:
            sentiment_desc = "bullish"
        elif forecast.market_sentiment < 0.9:
            sentiment_desc = "bearish"
        
        return (
            f"Forecast for {forecast.forecast_period_days} days: "
            f"Avg daily demand of {avg_daily:.0f} units. "
            f"Market sentiment is {sentiment_desc} ({forecast.market_sentiment}). "
            f"Confidence: {forecast.confidence * 100:.0f}%"
        )


# Singleton instance
prophet = ProphetAgent()
