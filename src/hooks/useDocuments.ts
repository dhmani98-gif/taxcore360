import { useState, useCallback } from 'react';
import { supabaseDocumentService } from '../services/supabaseDocumentService';
import type { Document, DocumentType, DocumentCategory } from '../app/featureTypes';

export function useDocuments(companyId: string) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async (filters?: {
    type?: DocumentType;
    category?: DocumentCategory;
    linkedEntityType?: string;
    linkedEntityId?: string;
  }) => {
    setLoading(true);
    try {
      const data = await supabaseDocumentService.getDocuments(companyId, filters);
      setDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const uploadDocument = useCallback(async (
    file: File,
    metadata: {
      name: string;
      type: DocumentType;
      category: DocumentCategory;
      linkedEntityType?: string;
      linkedEntityId?: string;
      uploadedBy: string;
    }
  ) => {
    setUploading(true);
    try {
      const newDocument = await supabaseDocumentService.uploadDocument(companyId, file, metadata);
      if (newDocument) {
        setDocuments(prev => [newDocument, ...prev]);
      }
      return newDocument;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    } finally {
      setUploading(false);
    }
  }, [companyId]);

  const deleteDocument = useCallback(async (documentId: number) => {
    const success = await supabaseDocumentService.deleteDocument(documentId);
    if (success) {
      setDocuments(prev => prev.filter(d => d.id !== documentId));
    }
    return success;
  }, []);

  const getDocumentUrl = useCallback(async (filePath: string) => {
    return await supabaseDocumentService.getDocumentUrl(filePath);
  }, []);

  return {
    documents,
    loading,
    uploading,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
  };
}
