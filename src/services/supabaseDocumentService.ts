import { supabase } from '../lib/supabase';
import type { Document, DocumentType, DocumentCategory } from '../app/featureTypes';

class DocumentService {
  async uploadDocument(
    companyId: string,
    file: File,
    metadata: {
      name: string;
      type: DocumentType;
      category: DocumentCategory;
      linkedEntityType?: string;
      linkedEntityId?: string;
      uploadedBy: string;
    }
  ): Promise<Document | null> {
    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${companyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Failed to upload file:', uploadError);
        return null;
      }

      // Get public URL
      supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Save metadata to database
      const { data, error } = await supabase
        .from('documents')
        .insert({
          company_id: companyId,
          name: metadata.name,
          type: metadata.type,
          category: metadata.category,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          linked_entity_type: metadata.linkedEntityType || null,
          linked_entity_id: metadata.linkedEntityId || null,
          uploaded_by: metadata.uploadedBy,
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save document metadata:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      return null;
    }
  }

  async getDocuments(
    companyId: string,
    filters?: {
      type?: DocumentType;
      category?: DocumentCategory;
      linkedEntityType?: string;
      linkedEntityId?: string;
    }
  ): Promise<Document[]> {
    try {
      let query = supabase
        .from('documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.linkedEntityType) {
        query = query.eq('linked_entity_type', filters.linkedEntityType);
      }

      if (filters?.linkedEntityId) {
        query = query.eq('linked_entity_id', filters.linkedEntityId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch documents:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async getDocumentUrl(filePath: string): Promise<string | null> {
    try {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      return null;
    }
  }

  async deleteDocument(documentId: number): Promise<boolean> {
    try {
      // Get document info first
      const { data: document } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (!document) {
        return false;
      }

      // Delete from Storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Failed to delete file from storage:', storageError);
      }

      // Delete from database
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) {
        console.error('Failed to delete document:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  async updateDocument(documentId: number, updates: Partial<Document>): Promise<Document | null> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error('Failed to update document:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      return null;
    }
  }
}

export const supabaseDocumentService = new DocumentService();
