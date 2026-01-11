"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AmountDisplay } from "@/components/ui/AmountDisplay";
import { Upload, FileText, Loader2, AlertTriangle, Camera, Image as ImageIcon, ChevronDown, ChevronUp, Check, X, FileJson, AlignLeft } from "lucide-react";
import { uploadDocument } from "@/lib/data";

interface ExtractedData {
  document_type?: string;
  vendor_name?: string;
  date?: string;
  total_amount?: number;
  tax?: number;
  full_text?: string;
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
  
  // Local state for review workflow (simulated)
  const [verifiedIds, setVerifiedIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"extracted" | "raw">("extracted");
  
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
            full_text: result.full_text,
            line_items: result.line_items,
            raw_text: result.raw_text
          }
        } : d
      ));
      setExpandedDoc(tempDoc.id);
      setActiveTab("extracted");
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

  const handleAccept = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setVerifiedIds(prev => new Set(prev).add(id));
    // In a real app, this would verify the transaction in the database
  };

  const handleReject = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would delete or flag the document
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (expandedDoc === id) setExpandedDoc(null);
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
              {uploading ? "AI is processing document..." : "Drop invoices & receipts here"}
            </p>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Supports PDF, PNG, JPG • Agent extracts all text & data automatically
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
            {documents.map((doc, index) => {
              const isVerified = verifiedIds.has(doc.id);
              
              return (
                <div key={doc.id}>
                  <div
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-accent-subtle)] cursor-pointer"
                    style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    onClick={() => doc.extractedData && toggleExpand(doc.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl" style={{ background: isVerified ? 'var(--success-light)' : 'var(--info-light)' }}>
                        <FileText className="h-6 w-6" style={{ color: isVerified ? 'var(--success-green)' : 'var(--info-blue)' }} />
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
                      
                      {/* Status Badge Logic */}
                      {doc.status === "processing" ? (
                        <StatusBadge status="processing" />
                      ) : doc.status === "failed" ? (
                        <StatusBadge status="failed" />
                      ) : isVerified ? (
                         <StatusBadge status="completed" />
                      ) : (
                        // Show "Pending Review" if completed but not verified
                         <span className="badge badge-warning text-[14px] py-1 px-2 flex items-center gap-1">
                           <Loader2 className="w-3 h-3" /> Review
                         </span>
                      )}

                      {doc.extractedData && (
                        expandedDoc === doc.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded Review Panel */}
                  {expandedDoc === doc.id && doc.extractedData && (
                    <div className="px-5 py-4" style={{ background: 'var(--bg-accent-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
                      
                      {/* Review Controls - Only if not verified */}
                      {!isVerified && (
                        <div className="mb-6 p-4 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                          <div className="flex justify-between items-center flex-wrap gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">Review Extracted Data</h3>
                              <p className="small-text text-[var(--text-secondary)]">
                                Please review the extracted text and values before finalizing.
                              </p>
                            </div>
                            <div className="flex gap-3">
                              <Button variant="danger" onClick={(e) => handleReject(doc.id, e)}>
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button variant="primary" onClick={(e) => handleAccept(doc.id, e)}>
                                <Check className="w-4 h-4 mr-2" />
                                Accept & Save
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tabs */}
                      <div className="flex gap-4 mb-4 border-b border-[var(--border-subtle)]">
                        <button
                          className={`pb-2 px-1 font-medium text-sm transition-colors ${
                            activeTab === "extracted" 
                              ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]" 
                              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          }`}
                          onClick={() => setActiveTab("extracted")}
                        >
                          <div className="flex items-center gap-2">
                            <FileJson className="w-4 h-4" />
                            Extracted Data (Structured)
                          </div>
                        </button>
                        <button
                          className={`pb-2 px-1 font-medium text-sm transition-colors ${
                            activeTab === "raw" 
                              ? "text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]" 
                              : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                          }`}
                          onClick={() => setActiveTab("raw")}
                        >
                          <div className="flex items-center gap-2">
                             <AlignLeft className="w-4 h-4" />
                             Raw Text (Source)
                          </div>
                        </button>
                      </div>

                      {/* Tab Content */}
                      {activeTab === "extracted" ? (
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
                          
                          {/* Line Items */}
                          {doc.extractedData.line_items && doc.extractedData.line_items.length > 0 && (
                            <div className="col-span-2 md:col-span-4 mt-2">
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
                      ) : (
                        <div className="bg-[var(--bg-secondary)] p-4 rounded-lg font-mono text-xs whitespace-pre-wrap max-h-96 overflow-y-auto border border-[var(--border-subtle)]">
                          {doc.extractedData.full_text || doc.extractedData.raw_text || "No raw text available."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
              Upload invoices, POs, or bank statements to extract data automatically.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
