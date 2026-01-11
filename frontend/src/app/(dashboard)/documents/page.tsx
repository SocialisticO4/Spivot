"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, Clock, XCircle, Loader2, AlertTriangle } from "lucide-react";
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

  const statusIcons = {
    completed: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    processing: <Clock className="h-5 w-5 text-amber-500 animate-pulse" />,
    pending: <Clock className="h-5 w-5 text-gray-400" />,
    failed: <XCircle className="h-5 w-5 text-red-500" />,
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    setUploadError(null);

    // Add to local state immediately
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
      // Update status to completed
      setDocuments(prev => prev.map(d => 
        d.id === tempDoc.id ? { ...d, status: "completed" as const } : d
      ));
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload document");
      // Update status to failed
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

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Processed by Visual Eye Agent (OCR)</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
            } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
          >
            {uploading ? (
              <Loader2 className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
            ) : (
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            )}
            <p className="text-lg font-medium text-gray-900 mb-2">
              {uploading ? "Uploading..." : "Drop your documents here"}
            </p>
            <p className="text-gray-500 mb-4">
              Supports PDF, PNG, JPG • Invoices, POs, Bank Statements
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <Button onClick={handleBrowse} disabled={uploading}>
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {uploadError && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Upload Failed</p>
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backend API Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="font-medium text-amber-700">Backend Required</p>
            <p className="text-sm text-amber-600">
              Document OCR processing requires the AWS Lambda backend. Make sure NEXT_PUBLIC_API_URL is configured.
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
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                      <p className="text-sm text-gray-500">{doc.type} • {doc.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcons[doc.status]}
                    <span className="text-sm text-gray-500 capitalize">{doc.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No documents uploaded</h2>
            <p className="text-gray-500">Upload invoices, POs, or bank statements to extract data automatically.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
