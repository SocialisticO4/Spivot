"""
API Endpoints - Document Upload & OCR Processing
"""
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user_id: int = 1
):
    """Upload and process a document using Visual Eye OCR."""
    
    # Validate file type
    allowed_types = [".pdf", ".png", ".jpg", ".jpeg", ".webp"]
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    
    if file_ext not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed: {allowed_types}"
        )
    
    # Read file content
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")
    
    # Process with Visual Eye
    try:
        from app.services.agents.visual_eye import visual_eye
        
        mime_type = visual_eye.get_mime_type(file.filename or "")
        extracted = await visual_eye.process_document(
            file_content=content,
            file_name=file.filename or "",
            mime_type=mime_type
        )
        
        return JSONResponse(content={
            "id": 1,
            "file_name": file.filename,
            "document_type": extracted.document_type,
            "vendor_name": extracted.vendor_name,
            "date": extracted.date,
            "total_amount": extracted.total_amount,
            "line_items": extracted.line_items,
            "status": "completed" if extracted.document_type != "Other" else "failed",
            "raw_text": extracted.raw_text[:500] if extracted.raw_text else None
        })
        
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"❌ Document processing error: {error_details}")
        return JSONResponse(
            status_code=500,
            content={
                "error": str(e),
                "detail": "Failed to process document with Visual Eye agent",
                "file_name": file.filename
            }
        )


@router.get("/")
async def list_documents(
    user_id: int = 1,
    limit: int = 20
):
    """List all documents for a user (demo mode - returns empty)."""
    return []


@router.get("/{doc_id}")
async def get_document(doc_id: int):
    """Get a specific document with extracted data."""
    raise HTTPException(status_code=404, detail="Document not found")
