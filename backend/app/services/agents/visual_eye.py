"""
The Visual Eye Agent - OCR & Document Ingestion
Uses Google Gemini 2.0 Flash for document processing.
"""
import json
import base64
from typing import Optional
from datetime import datetime
from google import genai
from google.genai import types
from app.core.config import get_settings
from app.models.pydantic_models import ExtractedDocumentData


EXTRACTION_PROMPT = """Extract the following from this document and return strictly structured JSON:

{
    "document_type": "Invoice" | "Purchase Order" | "Bank Statement" | "Receipt" | "Other",
    "vendor_name": "string or null",
    "date": "YYYY-MM-DD or null",
    "line_items": [
        {"description": "string", "quantity": number, "unit_price": number, "total": number}
    ],
    "total_amount": number or null,
    "tax": number or null
}

Only return valid JSON, no additional text or explanation."""


class VisualEyeAgent:
    """OCR and document ingestion agent using Google Gemini."""
    
    def __init__(self):
        settings = get_settings()
        self.client = genai.Client(api_key=settings.google_api_key)
        self.model = "gemini-2.0-flash"
    
    async def process_document(
        self, 
        file_content: bytes, 
        file_name: str,
        mime_type: str = "application/pdf"
    ) -> ExtractedDocumentData:
        """
        Process a document (PDF or Image) and extract structured data.
        
        Args:
            file_content: Raw bytes of the file
            file_name: Original filename
            mime_type: MIME type of the file
            
        Returns:
            ExtractedDocumentData with parsed information
        """
        try:
            # Encode file content to base64
            file_base64 = base64.standard_b64encode(file_content).decode("utf-8")
            
            # Create the content parts
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(
                            data=file_content,
                            mime_type=mime_type
                        ),
                        types.Part.from_text(EXTRACTION_PROMPT)
                    ]
                )
            ]
            
            # Generate response
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.1,  # Low temperature for structured extraction
                    max_output_tokens=2048
                )
            )
            
            # Parse JSON response
            response_text = response.text.strip()
            
            # Clean up response if wrapped in markdown code blocks
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            extracted_data = json.loads(response_text.strip())
            
            return ExtractedDocumentData(
                document_type=extracted_data.get("document_type", "Other"),
                vendor_name=extracted_data.get("vendor_name"),
                date=extracted_data.get("date"),
                line_items=extracted_data.get("line_items", []),
                total_amount=extracted_data.get("total_amount"),
                tax=extracted_data.get("tax"),
                raw_text=response_text
            )
            
        except json.JSONDecodeError as e:
            return ExtractedDocumentData(
                document_type="Other",
                raw_text=f"JSON parsing error: {str(e)}"
            )
        except Exception as e:
            return ExtractedDocumentData(
                document_type="Other",
                raw_text=f"Processing error: {str(e)}"
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


# Singleton instance
visual_eye = VisualEyeAgent()
