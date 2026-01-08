"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, Clock, XCircle } from "lucide-react";

const mockDocuments = [
  { id: 1, name: "Invoice_SteelSuppliers_Jan2026.pdf", status: "completed", type: "Invoice", date: "2026-01-08" },
  { id: 2, name: "BankStatement_HDFC_Dec2025.pdf", status: "completed", type: "Bank Statement", date: "2026-01-07" },
  { id: 3, name: "PO_4521_ABCAuto.pdf", status: "processing", type: "Purchase Order", date: "2026-01-07" },
  { id: 4, name: "Invoice_RubberWorld_Jan2026.pdf", status: "completed", type: "Invoice", date: "2026-01-06" },
];

const statusIcons = {
  completed: <CheckCircle className="h-5 w-5 text-emerald-500" />,
  processing: <Clock className="h-5 w-5 text-amber-500 animate-pulse" />,
  failed: <XCircle className="h-5 w-5 text-red-500" />,
};

export default function DocumentsPage() {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documents</h1>
        <p className="text-gray-500 mt-1">Processed by Visual Eye Agent</p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragOver ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
            }`}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop your documents here
            </p>
            <p className="text-gray-500 mb-4">
              Supports PDF, PNG, JPG • Invoices, POs, Bank Statements
            </p>
            <Button>Browse Files</Button>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDocuments.map((doc) => (
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
                  {statusIcons[doc.status as keyof typeof statusIcons]}
                  <span className="text-sm text-gray-500 capitalize">{doc.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
