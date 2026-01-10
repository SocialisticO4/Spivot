"""
API Endpoints - Document Upload & OCR Processing
"""
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.schemas import Document, AgentLog, DocumentStatus, AgentSeverity
from app.models.pydantic_models import DocumentResponse
from app.services.agents import visual_eye


router = APIRouter(prefix="/documents", tags=["Documents"])


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: int = 1,
    db: AsyncSession = Depends(get_db)
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
    content = await file.read()
    
    # Create document record
    doc = Document(
        user_id=user_id,
        file_url=f"uploads/{file.filename}",  # In production, upload to S3
        file_name=file.filename or "unknown",
        status=DocumentStatus.PROCESSING
    )
    db.add(doc)
    await db.flush()
    
    # Process with Visual Eye
    try:
        mime_type = visual_eye.visual_eye.get_mime_type(file.filename or "")
        extracted = await visual_eye.visual_eye.process_document(
            file_content=content,
            file_name=file.filename or "",
            mime_type=mime_type
        )
        
        doc.extracted_json = extracted.model_dump()
        doc.document_type = extracted.document_type
        doc.status = DocumentStatus.COMPLETED
        doc.processed_at = datetime.utcnow()
        
        # Log success
        log = AgentLog(
            agent_name="Visual Eye",
            action=f"Processed document: {file.filename}",
            result=f"Extracted {len(extracted.line_items)} line items",
            severity=AgentSeverity.INFO
        )
        db.add(log)
        
    except Exception as e:
        doc.status = DocumentStatus.FAILED
        doc.extracted_json = {"error": str(e)}
        
        # Log failure
        log = AgentLog(
            agent_name="Visual Eye",
            action=f"Failed to process: {file.filename}",
            result=str(e),
            severity=AgentSeverity.WARNING
        )
        db.add(log)
    
    await db.commit()
    await db.refresh(doc)
    
    return doc


@router.get("/", response_model=list[DocumentResponse])
async def list_documents(
    user_id: int = 1,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """List all documents for a user."""
    
    result = await db.execute(
        select(Document)
        .where(Document.user_id == user_id)
        .order_by(Document.created_at.desc())
        .limit(limit)
    )
    
    return result.scalars().all()


@router.get("/{doc_id}", response_model=DocumentResponse)
async def get_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific document with extracted data."""
    
    doc = await db.get(Document, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return doc
