"""
AWS Lambda Handler for Spivot Backend
Uses Mangum to adapt FastAPI to AWS Lambda
"""
from mangum import Mangum
from app.main import app

# Create Lambda handler
handler = Mangum(app, lifespan="off")
