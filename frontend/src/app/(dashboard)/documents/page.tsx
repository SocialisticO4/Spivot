"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Upload, FileText, Loader2, AlertTriangle, Camera, Image as ImageIcon } from "lucide-react";
import { uploadDocument } from "@/lib/data";

interface Document {
  id: number;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  date: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    setUploadError(null);

    const tempDoc: Document = {
      id: Date.now(),
      name: file.name,
      status: "processing",
      type: file.type.includes("pdf") ? "PDF" : "Image",
      date: new Date().toISOString().split("T")[0],
    };
    setDocuments(prev => [tempDoc, ...prev]);

    try {
      await uploadDocument(file);
      setDocuments(prev => prev.map(d => 
        d.id === tempDoc.id ? { ...d, status: "completed" as const } : d
      ));
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload document");
      setDocuments(prev => prev.map(d => 
        d.id === tempDoc.id ? { ...d, status: "failed" as const } : d
      ));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="heading-1">Documents</h1>
        <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>
          Processed by Visual Eye Agent (OCR)
        </p>
      </div>

      {/* Upload Area */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[var(--radius-xl)] p-8 sm:p-12 text-center transition-all cursor-pointer ${
              dragOver 
                ? "border-[var(--accent-primary)] bg-[var(--accent-light)]" 
                : "border-[var(--border-default)]"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-12 w-12 mx-auto animate-spin mb-4" style={{ color: 'var(--accent-primary)' }} />
            ) : (
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                <Upload className="h-8 w-8" style={{ color: 'var(--accent-primary)' }} />
              </div>
            )}
            <p className="heading-2 mb-2">
              {uploading ? "Uploading..." : "Drop your documents here"}
            </p>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Supports PDF, PNG, JPG • Invoices, POs, Bank Statements
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button disabled={uploading}>
                <ImageIcon className="w-5 h-5" />
                Browse Files
              </Button>
              <Button variant="secondary" disabled={uploading}>
                <Camera className="w-5 h-5" />
                Take Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {uploadError && (
        <Card className="mb-6" style={{ background: 'var(--loss-light)', borderColor: 'var(--loss-red)' }}>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--loss-red)' }} />
            <div>
              <p className="font-medium" style={{ color: 'var(--loss-red)' }}>Upload Failed</p>
              <p className="small-text" style={{ color: 'var(--loss-red)' }}>{uploadError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backend Note */}
      <Card className="mb-6" style={{ background: 'var(--pending-light)', borderColor: 'var(--pending-amber)' }}>
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--pending-amber)' }} />
          <div>
            <p className="font-medium" style={{ color: 'var(--pending-amber)' }}>Backend Required</p>
            <p className="small-text">
              Document OCR uses Claude 3 Haiku on AWS Bedrock.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-accent-subtle)]"
                style={{ borderBottom: index < documents.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl" style={{ background: 'var(--info-light)' }}>
                    <FileText className="h-6 w-6" style={{ color: 'var(--info-blue)' }} />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.name}</p>
                    <p className="small-text">{doc.type} • {doc.date}</p>
                  </div>
                </div>
                <StatusBadge status={doc.status === "completed" ? "completed" : doc.status === "processing" ? "processing" : "failed"} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="empty-state">
            <FileText className="empty-state-icon" />
            <h2 className="empty-state-title">No documents uploaded</h2>
            <p className="empty-state-description">
              Upload invoices, POs, or bank statements to extract data automatically with AI.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
