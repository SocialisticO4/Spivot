"""
The Visual Eye Agent - OCR & Document Ingestion
Using Claude 3 Haiku on AWS Bedrock (Mumbai region)
"""
import json
import base64
import os
import boto3
from typing import Optional
from datetime import datetime

from app.models.pydantic_models import ExtractedDocumentData

# -------------------------------------------------------------------------
# PROMPT
# -------------------------------------------------------------------------
EXTRACTION_PROMPT = """Extract the following fields from this document and return ONLY valid JSON:

{
    "document_type": "Invoice" | "Purchase Order" | "Bank Statement" | "Receipt" | "Other",
    "vendor_name": "string or null",
    "date": "YYYY-MM-DD or null",
    "total_amount": number or null,
    "tax": number or null,
    "line_items": [{"description": "string", "quantity": number, "unit_price": number, "total": number}]
}

Return ONLY the JSON object. No markdown, no explanation."""


class VisualEyeAgent:
    """
    Document OCR Agent using Claude 3 Haiku on AWS Bedrock.
    Available in Mumbai (ap-south-1) for low latency.
    """
    
    def __init__(self):
        # Claude 3 Haiku - fast and cheap
        self.model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        self.region = "ap-south-1"  # Mumbai - same as Lambda
        self.client = None
        
        self._init_bedrock()

    def _init_bedrock(self):
        """Initialize AWS Bedrock Runtime."""
        try:
            self.client = boto3.client(
                "bedrock-runtime", 
                region_name=self.region
            )
            print(f"✅ Visual Eye: Claude 3 Haiku ready ({self.region})")
        except Exception as e:
            print(f"❌ Visual Eye: Bedrock init failed: {e}")

    async def process_document(
        self, 
        file_content: bytes, 
        file_name: str,
        mime_type: str = "application/pdf"
    ) -> ExtractedDocumentData:
        """Process document using Claude 3 Haiku."""
        
        if not self.client:
            return ExtractedDocumentData(
                document_type="Other",
                raw_text="Error: Bedrock client not initialized"
            )
        
        try:
            # Encode image to base64
            image_b64 = base64.standard_b64encode(file_content).decode("utf-8")
            
            # Map mime type
            media_type = mime_type
            if mime_type == "application/pdf":
                media_type = "application/pdf"
            
            # Claude 3 message format
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_b64
                            }
                        },
                        {
                            "type": "text",
                            "text": EXTRACTION_PROMPT
                        }
                    ]
                }
            ]
            
            # Call Claude 3 Haiku
            response = self.client.invoke_model(
                modelId=self.model_id,
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2048,
                    "temperature": 0.1,
                    "messages": messages
                })
            )
            
            # Parse response
            result = json.loads(response["body"].read())
            text = result["content"][0]["text"]
            
            return self._parse_json_response(text)
            
        except Exception as e:
            print(f"❌ Claude processing error: {e}")
            return ExtractedDocumentData(
                document_type="Other",
                raw_text=f"Processing error: {str(e)}"
            )

    def _parse_json_response(self, text: str) -> ExtractedDocumentData:
        """Parse JSON from Claude response."""
        text = text.strip()
        
        # Remove markdown if present
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
            
        try:
            data = json.loads(text.strip())
            return ExtractedDocumentData(
                document_type=data.get("document_type", "Other"),
                vendor_name=data.get("vendor_name"),
                date=data.get("date"),
                line_items=data.get("line_items", []),
                total_amount=data.get("total_amount"),
                tax=data.get("tax"),
                raw_text=text
            )
        except json.JSONDecodeError as e:
            return ExtractedDocumentData(
                document_type="Other",
                raw_text=f"JSON Error: {e} | Raw: {text[:300]}"
            )

    def get_mime_type(self, file_name: str) -> str:
        """Determine MIME type from filename."""
        lower_name = file_name.lower()
        if lower_name.endswith(".pdf"):
            return "application/pdf"
        elif lower_name.endswith(".png"):
            return "image/png"
        elif lower_name.endswith((".jpg", ".jpeg")):
            return "image/jpeg"
        elif lower_name.endswith(".webp"):
            return "image/webp"
        else:
            return "application/octet-stream"


# Singleton
visual_eye = VisualEyeAgent()
