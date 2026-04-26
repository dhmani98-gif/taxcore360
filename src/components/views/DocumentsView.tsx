import { useState, useRef } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import type { DocumentType, DocumentCategory } from '../../app/featureTypes';

interface DocumentsViewProps {
  companyId: string | undefined;
  userId: string | undefined;
}

export function DocumentsView({ companyId, userId }: DocumentsViewProps) {
  const { documents, loading, uploading, uploadDocument, deleteDocument, getDocumentUrl } = useDocuments(companyId || '');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<DocumentCategory | 'all'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredDocuments = documents.filter(doc => {
    if (filterType !== 'all' && doc.type !== filterType) return false;
    if (filterCategory !== 'all' && doc.category !== filterCategory) return false;
    return true;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const metadata = {
      name: file.name,
      type: 'other' as DocumentType,
      category: 'general' as DocumentCategory,
      uploadedBy: userId,
    };

    await uploadDocument(file, metadata);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    const url = await getDocumentUrl(filePath);
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    }
  };

  const handleDelete = async (documentId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(documentId);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '+ Upload Document'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DocumentType | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Types</option>
          <option value="W-9">W-9</option>
          <option value="contract">Contract</option>
          <option value="invoice">Invoice</option>
          <option value="receipt">Receipt</option>
          <option value="other">Other</option>
        </select>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as DocumentCategory | 'all')}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Categories</option>
          <option value="employee">Employee</option>
          <option value="vendor">Vendor</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-8">Loading documents...</div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No documents found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  doc.category === 'employee' ? 'bg-blue-100 text-blue-800' :
                  doc.category === 'vendor' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.category}
                </span>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                <p>Size: {formatFileSize(doc.file_size)}</p>
                <p>Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(doc.file_path, doc.name)}
                  className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
