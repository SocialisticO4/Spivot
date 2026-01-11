"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AmountDisplay } from "@/components/ui/AmountDisplay";
import { Upload, FileText, Loader2, AlertTriangle, Camera, Image as ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import { uploadDocument } from "@/lib/data";

interface ExtractedData {
  document_type?: string;
  vendor_name?: string;
  date?: string;
  total_amount?: number;
  tax?: number;
  line_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  raw_text?: string;
}

interface Document {
  id: number;
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  type: string;
  date: string;
  extractedData?: ExtractedData;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);
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
      const result = await uploadDocument(file);
      console.log("Upload result:", result);
      
      setDocuments(prev => prev.map(d => 
        d.id === tempDoc.id ? { 
          ...d, 
          status: "completed" as const,
          extractedData: {
            document_type: result.document_type,
            vendor_name: result.vendor_name,
            date: result.date,
            total_amount: result.total_amount,
            tax: result.tax,
            line_items: result.line_items,
            raw_text: result.raw_text
          }
        } : d
      ));
      setExpandedDoc(tempDoc.id);
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

  const toggleExpand = (id: number) => {
    setExpandedDoc(expandedDoc === id ? null : id);
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="heading-1">Documents</h1>
        <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>
          Processed by Visual Eye Agent (Claude 3 Haiku)
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
              {uploading ? "Processing with AI..." : "Drop your documents here"}
            </p>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Supports PDF, PNG, JPG • Invoices, POs, Bank Statements
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
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

      {/* Document List */}
      {documents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {documents.map((doc, index) => (
              <div key={doc.id}>
                <div
                  className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-accent-subtle)] cursor-pointer"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onClick={() => doc.extractedData && toggleExpand(doc.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl" style={{ background: 'var(--info-light)' }}>
                      <FileText className="h-6 w-6" style={{ color: 'var(--info-blue)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.name}</p>
                      <p className="small-text">
                        {doc.extractedData?.document_type || doc.type} • {doc.extractedData?.date || doc.date}
                        {doc.extractedData?.vendor_name && ` • ${doc.extractedData.vendor_name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {doc.extractedData?.total_amount && (
                      <AmountDisplay amount={doc.extractedData.total_amount} size="sm" />
                    )}
                    <StatusBadge status={doc.status === "completed" ? "completed" : doc.status === "processing" ? "processing" : "failed"} />
                    {doc.extractedData && (
                      expandedDoc === doc.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {expandedDoc === doc.id && doc.extractedData && (
                  <div className="px-5 py-4" style={{ background: 'var(--bg-accent-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>Document Type</p>
                        <p className="font-medium">{doc.extractedData.document_type || "Unknown"}</p>
                      </div>
                      <div>
                        <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>Vendor</p>
                        <p className="font-medium">{doc.extractedData.vendor_name || "Not found"}</p>
                      </div>
                      <div>
                        <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>Date</p>
                        <p className="font-medium">{doc.extractedData.date || "Not found"}</p>
                      </div>
                      <div>
                        <p className="small-text" style={{ color: 'var(--text-tertiary)' }}>Tax</p>
                        <p className="font-medium">{doc.extractedData.tax ? `₹${doc.extractedData.tax.toLocaleString('en-IN')}` : "N/A"}</p>
                      </div>
                    </div>
                    
                    {/* Line Items */}
                    {doc.extractedData.line_items && doc.extractedData.line_items.length > 0 && (
                      <div>
                        <p className="small-text mb-2" style={{ color: 'var(--text-tertiary)' }}>Line Items</p>
                        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                          <table className="w-full text-sm">
                            <thead style={{ background: 'var(--bg-secondary)' }}>
                              <tr>
                                <th className="text-left px-3 py-2">Description</th>
                                <th className="text-right px-3 py-2">Qty</th>
                                <th className="text-right px-3 py-2">Price</th>
                                <th className="text-right px-3 py-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {doc.extractedData.line_items.map((item, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                  <td className="px-3 py-2">{item.description}</td>
                                  <td className="text-right px-3 py-2">{item.quantity}</td>
                                  <td className="text-right px-3 py-2">₹{item.unit_price?.toLocaleString('en-IN')}</td>
                                  <td className="text-right px-3 py-2">₹{item.total?.toLocaleString('en-IN')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
